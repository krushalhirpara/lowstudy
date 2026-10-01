import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth, sanitizeInput } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = verifyAuth(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = sanitizeInput(searchParams.get('search') || '').trim();
    const provider = searchParams.get('provider') || 'all';
    const status = searchParams.get('status') || 'all';
    const cityFilter = searchParams.get('city') || 'all';
    const universityFilter = searchParams.get('university') || searchParams.get('universityId') || 'all';
    const profileStatus = searchParams.get('profileStatus') || 'all';
    const dateRange = searchParams.get('dateRange') || 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where = {};

    // 1. Search filter (Name, Email, Phone, ID, City)
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search.toLowerCase() } },
        { phoneNumber: { contains: search } },
        { id: { contains: search } },
        { city: { contains: search } },
      ];
    }

    // 2. Provider filter
    if (provider !== 'all') {
      if (provider === 'google') {
        where.provider = 'google';
      } else if (provider === 'credentials' || provider === 'email') {
        where.provider = { not: 'google' };
      }
    }

    // 3. Status filter
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    // 4. City filter
    if (cityFilter && cityFilter !== 'all') {
      where.city = { equals: cityFilter };
    }

    // 5. University filter
    if (universityFilter && universityFilter !== 'all') {
      where.universityId = { equals: universityFilter };
    }

    // 6. Profile Completion Status Filter
    if (profileStatus === 'complete') {
      where.AND = [
        { city: { not: null } },
        { universityId: { not: null } },
      ];
    } else if (profileStatus === 'incomplete') {
      where.OR = [
        { city: null },
        { universityId: null },
      ];
    }

    // 7. Date range filter
    const now = new Date();
    if (dateRange === 'today') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      where.createdAt = { gte: startOfToday };
    } else if (dateRange === '7d') {
      where.createdAt = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (dateRange === '30d') {
      where.createdAt = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    } else if (dateRange === 'thisMonth') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      where.createdAt = { gte: startOfMonth };
    }

    // Compute start timestamps for stats
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      total,
      users,
      totalStudents,
      addedToday,
      addedThisMonth,
      googleUsers,
      emailUsers,
      incompleteCount,
      allUniversities,
      distinctUsersForStats,
    ] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          profileCompleted: true,
          provider: true,
          role: true,
          isActive: true,
          city: true,
          universityId: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          lastActiveAt: true,
          streakDays: true,
          xp: true,
          coins: true,
          avatar: true,
          university: {
            select: {
              id: true,
              name: true,
              code: true,
              city: true,
            },
          },
          _count: {
            select: {
              pageViews: true,
              loginEvents: true,
              testAttempts: true,
            },
          },
        },
      }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { provider: 'google' } }),
      prisma.user.count({ where: { provider: { not: 'google' } } }),
      prisma.user.count({
        where: {
          OR: [{ city: null }, { universityId: null }],
        },
      }),
      prisma.university.findMany({
        select: { id: true, name: true, code: true, city: true },
        orderBy: { name: 'asc' },
      }),
      prisma.user.findMany({
        select: { city: true, universityId: true },
      }),
    ]);

    // Aggregate City counts dynamically
    const cityMap = {};
    const uniMap = {};

    distinctUsersForStats.forEach((u) => {
      if (u.city) {
        cityMap[u.city] = (cityMap[u.city] || 0) + 1;
      }
      if (u.universityId) {
        uniMap[u.universityId] = (uniMap[u.universityId] || 0) + 1;
      }
    });

    const topCities = Object.entries(cityMap)
      .map(([name, count]) => ({ city: name, count }))
      .sort((a, b) => b.count - a.count);

    const universityNameMap = new Map(allUniversities.map((u) => [u.id, u.name]));
    const universityCounts = Object.entries(uniMap)
      .map(([id, count]) => ({
        universityId: id,
        name: universityNameMap.get(id) || id.toUpperCase(),
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats: {
        totalStudents,
        totalUsers: distinctUsersForStats.length,
        addedToday,
        addedThisMonth,
        googleUsers,
        emailUsers,
        completeProfiles: distinctUsersForStats.length - incompleteCount,
        incompleteProfiles: incompleteCount,
        topCities,
        universityCounts,
      },
      universitiesList: allUniversities,
    });
  } catch (err) {
    console.error('[GET /api/ceoadmin/users] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

/**
 * PATCH /api/ceoadmin/users - Update user active status or role (Admin action)
 */
export async function PATCH(request) {
  const auth = verifyAuth(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { userId, isActive, role } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const dataToUpdate = {};
    if (typeof isActive === 'boolean') {
      dataToUpdate.isActive = isActive;
    }
    if (role && ['STUDENT', 'ADMIN'].includes(role.toUpperCase())) {
      dataToUpdate.role = role.toUpperCase();
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}
