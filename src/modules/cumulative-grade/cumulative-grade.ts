import { waitForOne } from "../../utils/dom";

interface Grade {
  earned: number;
  max: number;
}

interface Assignment {
  name: string;
  grade: Grade;
}

function calculateAverage(assignments: Assignment[]) {
  const { earned, max } = assignments.map(({ grade }) => grade).reduce((a, b) => ({
    earned: a.earned + b.earned,
    max: a.max + b.max
  }));
  return (earned / max) * 100;
}

interface AssignmentType {
  filter: RegExp | string; // filter on the name
  weight: number;
}

type CumulativeGradeCalculator = (assignments: Assignment[]) => number;

function generateCumulativeGradeCalculator(assignmentTypes: AssignmentType[]): CumulativeGradeCalculator {
  return assignments => {
    const weightedGrades = assignmentTypes.map(type => {
      const matchedAssignments = assignments.filter(a => {
        if (typeof type.filter == 'string') {
          return a.name.includes(type.filter);
        }
        return !!a.name.match(type.filter)
      });
      return calculateAverage(matchedAssignments) * type.weight;
    });
    return weightedGrades.reduce((a, b) => a + b) / 100;
  }
}

function calculateCumulativeGrade(courseId: string, assignments: Assignment[]) {
  const map: { [courseId: string]: CumulativeGradeCalculator } = {
    // PSCI 107
    "290246": generateCumulativeGradeCalculator([
      { filter: 'Check of Understanding', weight: 30 },
      { filter: 'Exam', weight: 70 }
    ])
  };

  const calculator = map[courseId];
  return calculator ? calculator(assignments) : calculateAverage(assignments);
}

export default async function cumulativeGrade() {
  const assignmentElems = await waitForOne(() => document.querySelectorAll('#assignments-student-table tbody tr'));

  const assignments = assignmentElems.map(elem => {
    const name = elem.querySelector('.table--primaryLink').textContent;
    const [earned, max] = elem.querySelector('.submissionStatus--score')?.textContent.split('/').map(Number);
    if (earned == null) {
      return null;
    }
    return {
      name,
      grade: {
        earned, 
        max
      }
    }
  }).filter(Boolean) // remove ungraded

  const courseId = window.location.href.split('/')[4];
  const grade = calculateCumulativeGrade(courseId, assignments);

  document.querySelector(
    ".courseHeader"
  ).innerHTML += `<div>Grade: ${grade.toFixed(2)}%</div>`;
}
