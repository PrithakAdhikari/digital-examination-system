import { useQuery } from "@tanstack/react-query";
import * as teacherApi from "../api/teacher.js";
import { teacherKeys } from "../api/queryKeys.js";

export function useTeacherExamSummary() {
  return useQuery({
    queryKey: teacherKeys.examSummary(),
    queryFn: teacherApi.getTeacherExamSummary,
  });
}

export function useTeacherUpcomingExaminations() {
  return useQuery({
    queryKey: teacherKeys.upcomingExaminations(),
    queryFn: () => teacherApi.getTeacherUpcomingExaminations({ limit: 6 }),
  });
}

export function useTeacherTopStudents() {
  return useQuery({
    queryKey: teacherKeys.topStudents(),
    queryFn: () => teacherApi.getTeacherTopStudents({ limit: 3 }),
  });
}

export function useTeacherAverageResultsOverExaminations() {
  return useQuery({
    queryKey: teacherKeys.averageResultsOverExaminations(),
    queryFn: teacherApi.getTeacherAverageResultsOverExaminations,
  });
}

export function useAssignedQuestionsToWrite() {
  return useQuery({
    queryKey: teacherKeys.assignedQuestionsToWrite(),
    queryFn: teacherApi.getAssignedQuestionsToWrite,
  });
}
