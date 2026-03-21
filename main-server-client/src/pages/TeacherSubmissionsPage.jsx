import React from "react";
import { useParams, Link } from "react-router-dom";
import { useStudentsToGrade } from "../hooks/useTeacherQueries";

const TeacherSubmissionsPage = () => {
  const { subjectId } = useParams();
  const { data: students, isLoading, isError, error } = useStudentsToGrade(subjectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Error loading assigned students: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/teacher/answers"
          className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Subjects
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assigned Student Submissions</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol No / Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Answers Count</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {students && students.length > 0 ? (
                students.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{student.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {student.answers_count > 0 ? "Submitted" : "Not Submitted"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">{student.answers_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {student.answers_count > 0 ? (
                        <Link
                          to={`/teacher/grading/${subjectId}/${student.student_user_fk_id}`}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          Check
                        </Link>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600">Check</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    No students assigned to check for this subject.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherSubmissionsPage;
