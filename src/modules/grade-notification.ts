import storage from "../utils/storage";
import { constructButton, waitForOne } from "../utils/dom";

interface Course {
  href: string;
  courseBox: HTMLElement,
  assignments: Assignment[];
}

interface Assignment {
  name: string;
  href: string;
  grade: string;
}

function getCourses(): Array<Promise<Course>> {
  const courseBoxes = document.querySelectorAll<HTMLAnchorElement>('.courseBox:not(.courseBox-new)');
  return Array.from(courseBoxes).map(async courseBox => ({
      href: courseBox.href,
      courseBox,
      assignments: await getCourseGradededAssignments(courseBox.href),
  }))
}

function createCoursePage(html: string) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div;
}

function getPageGradedAssignments(page: HTMLElement) {
  const rows = page.querySelectorAll('#assignments-student-table tbody tr');
  const assignments = Array.from(rows).map(row => {
      const primaryLink = row.querySelector<HTMLAnchorElement>('.table--primaryLink a');
      const score = row.querySelector('.submissionStatus--score');
      if (!score) {
          return {
            name: '',
            href: '',
            grade: '',
          }
      }
      return {
          name: primaryLink.textContent,
          href: primaryLink.href,
          grade: score && score.textContent
      }
  }).filter(assignment => assignment.grade);
  return assignments;
}

async function getCourseGradededAssignments(href: string): Promise<Assignment[]> {
  const html = await fetch(href).then(r=>r.text());
  const page = createCoursePage(html);
  return getPageGradedAssignments(page);
}

function addNewGradedNotification(courseBox: HTMLElement, count: number) {
  const notificationElem = document.createElement('div');
  notificationElem.textContent = `${count}`;
  notificationElem.className = 'gradescope-plus__new-grades'
  courseBox.appendChild(notificationElem);
}

async function getNewGraded() {
  const courses = await Promise.all(getCourses());
  const seenGraded = await storage.get<string[]>('seen') || [];
  
  for (const course of courses) {
    const newGraded = course.assignments.filter(assignment => {
      return !seenGraded.includes(assignment.href);
    });
    console.log(seenGraded, course.assignments.map(a => a.href));
      addNewGradedNotification(course.courseBox, newGraded.length);
  }
}

export default getNewGraded;

export function showMarkAsRead() {
  const button = constructButton('Mark As Seen', 'check', async () => {
    const assignmentHrefs = getPageGradedAssignments(document.body).map(({ href }) => href);
    const seen = await storage.get<string[]>('seen') || [];
    storage.set('seen', [...new Set([...seen, ...assignmentHrefs])]);
  });
  const header = document.querySelector('.courseHeader');
  header.after(button);
}

export async function highlightNewGraded() {
  const seen = await storage.get<string[]>('seen') || [];
}

