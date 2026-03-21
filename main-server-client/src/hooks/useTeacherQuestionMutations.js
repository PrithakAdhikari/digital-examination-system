import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as teacherApi from "../api/teacher.js";
import { teacherKeys } from "../api/queryKeys.js";

export function useCreateTeacherQuestionPaper() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: teacherApi.createTeacherQuestionPaper,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.assignedQuestionsToWrite() });
    },
  });
}
