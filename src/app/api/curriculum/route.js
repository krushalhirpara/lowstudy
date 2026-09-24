import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const universityCode = (searchParams.get('university') || searchParams.get('uni') || 'SU').toUpperCase();
    const courseCode = searchParams.get('course') || 'LLB-3Y';
    const semesterNum = parseInt(searchParams.get('semester') || searchParams.get('sem') || '3', 10);

    // Find University
    const university = await prisma.university.findFirst({
      where: {
        OR: [
          { code: universityCode },
          { id: universityCode.toLowerCase() }
        ]
      }
    });

    if (!university) {
      return NextResponse.json({ error: `University not found for code: ${universityCode}` }, { status: 404 });
    }

    // Find Course
    const course = await prisma.course.findFirst({
      where: {
        universityId: university.id,
        OR: [
          { code: courseCode },
          { id: `${university.id}-${courseCode.toLowerCase()}` },
          { id: 'su-llb-3yr' }
        ]
      }
    });

    if (!course) {
      return NextResponse.json({ error: `Course not found for university: ${university.name}` }, { status: 404 });
    }

    // Find Semester
    const semester = await prisma.semester.findFirst({
      where: {
        courseId: course.id,
        semesterNumber: semesterNum
      }
    });

    if (!semester) {
      return NextResponse.json({ error: `Semester ${semesterNum} not found for course: ${course.name}` }, { status: 404 });
    }

    // Fetch Subjects with complete Unit -> Topic -> SubTopic hierarchy
    const subjects = await prisma.subject.findMany({
      where: {
        semesterId: semester.id
      },
      orderBy: {
        shortCode: 'asc'
      },
      include: {
        units: {
          orderBy: {
            unitNumber: 'asc'
          },
          include: {
            topics: {
              orderBy: {
                topicNumber: 'asc'
              },
              include: {
                subTopics: {
                  orderBy: {
                    orderIndex: 'asc'
                  }
                }
              }
            }
          }
        }
      }
    });

    // Also get all available semesters for course navigation
    const allSemesters = await prisma.semester.findMany({
      where: { courseId: course.id },
      orderBy: { semesterNumber: 'asc' },
      select: { id: true, semesterNumber: true, title: true }
    });

    return NextResponse.json({
      success: true,
      hierarchy: {
        university: {
          id: university.id,
          name: university.name,
          code: university.code,
          city: university.city,
          state: university.state,
          academicYear: university.academicYear,
          officialWebsite: university.officialWebsite
        },
        course: {
          id: course.id,
          name: course.name,
          code: course.code,
          totalSemesters: course.totalSemesters
        },
        semester: {
          id: semester.id,
          semesterNumber: semester.semesterNumber,
          title: semester.title
        },
        allSemesters,
        subjectsCount: subjects.length,
        subjects: subjects.map(subj => ({
          id: subj.id,
          code: subj.shortCode,
          title: subj.title,
          category: subj.category,
          credits: subj.credits,
          marks: 100,
          description: subj.description,
          unitsCount: subj.units.length,
          topicsCount: subj.units.reduce((acc, u) => acc + u.topics.length, 0),
          subtopicsCount: subj.units.reduce((acc, u) => acc + u.topics.reduce((tacc, t) => tacc + t.subTopics.length, 0), 0),
          units: subj.units.map(unit => ({
            id: unit.id,
            unitNumber: unit.unitNumber,
            title: unit.title,
            description: unit.description,
            topics: unit.topics.map(topic => ({
              id: topic.id,
              topicNumber: topic.topicNumber,
              title: topic.title,
              description: topic.description,
              status: topic.status,
              subtopics: topic.subTopics.map(st => ({
                id: st.id,
                orderIndex: st.orderIndex,
                title: st.title,
                content: st.content
              }))
            }))
          }))
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching curriculum hierarchy:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
