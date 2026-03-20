import User from "./User.js";
import Examination from "./Examination.js";
import ExaminationCenter from "./ExaminationCenter.js";
import ExaminationSubject from "./ExaminationSubject.js";
import SubjectPaper from "./SubjectPaper.js";
import PaperQuestion from "./PaperQuestion.js";
import ExamAnswerToken from "./ExamAnswerToken.js";
import StudentQuestionAnswer from "./StudentQuestionAnswer.js";
import StudentAnswerMarks from "./StudentAnswerMarks.js";
import ExamStudent from "./ExamStudent.js";
import Token from "./Token.js";

const setupAssociations = () => {
  // --- User Relationships ---
  User.belongsTo(ExaminationCenter, { foreignKey: "center_fk_id", as: "center" });
  ExaminationCenter.hasMany(User, { foreignKey: "center_fk_id", as: "staff" });

  // --- Examination Relationships ---
  Examination.belongsTo(User, { foreignKey: "creator_user_fk_id", as: "creator" });
  User.hasMany(Examination, { foreignKey: "creator_user_fk_id", as: "createdExaminations" });

  Examination.hasMany(ExaminationSubject, { foreignKey: "exam_fk_id", as: "subjects" });
  ExaminationSubject.belongsTo(Examination, { foreignKey: "exam_fk_id", as: "examination" });

  // --- ExaminationSubject Relationships ---
  ExaminationSubject.belongsTo(User, { foreignKey: "exam_setter_user_fk_id", as: "setter" });
  User.hasMany(ExaminationSubject, { foreignKey: "exam_setter_user_fk_id", as: "assignedSets" });

  ExaminationSubject.hasMany(SubjectPaper, { foreignKey: "subject_fk_id", as: "papers" });
  SubjectPaper.belongsTo(ExaminationSubject, { foreignKey: "subject_fk_id", as: "subject" });

  // --- SubjectPaper Relationships ---
  SubjectPaper.hasMany(PaperQuestion, { foreignKey: "paper_fk_id", as: "questions" });
  PaperQuestion.belongsTo(SubjectPaper, { foreignKey: "paper_fk_id", as: "paper" });

  // --- PaperQuestion Relationships ---
  PaperQuestion.hasOne(ExamAnswerToken, { foreignKey: "question_fk_id", as: "answerKey" });
  ExamAnswerToken.belongsTo(PaperQuestion, { foreignKey: "question_fk_id", as: "question" });

  // --- Student Answer & Marks Relationships ---
  StudentQuestionAnswer.belongsTo(User, { foreignKey: "stud_user_fk_id", as: "student" });
  User.hasMany(StudentQuestionAnswer, { foreignKey: "stud_user_fk_id", as: "answers" });

  StudentQuestionAnswer.belongsTo(PaperQuestion, { foreignKey: "exam_question_fk_id", as: "question" });
  PaperQuestion.hasMany(StudentQuestionAnswer, { foreignKey: "exam_question_fk_id", as: "studentAnswers" });

  StudentQuestionAnswer.belongsTo(Examination, { foreignKey: "exam_fk_id", as: "examination" });
  StudentQuestionAnswer.belongsTo(ExaminationSubject, { foreignKey: "subject_fk_id", as: "subject" });

  StudentAnswerMarks.belongsTo(User, { foreignKey: "stud_user_fk_id", as: "student" });
  StudentAnswerMarks.belongsTo(StudentQuestionAnswer, { foreignKey: "stud_answer_fk_id", as: "answer" });
  StudentQuestionAnswer.hasOne(StudentAnswerMarks, { foreignKey: "stud_answer_fk_id", as: "marks" });

  StudentAnswerMarks.belongsTo(Examination, { foreignKey: "exam_fk_id", as: "examination" });
  StudentAnswerMarks.belongsTo(ExaminationSubject, { foreignKey: "subject_fk_id", as: "subject" });

  // --- Exam Enrollment (ExamStudent) Relationships ---
  ExamStudent.belongsTo(Examination, { foreignKey: "exam_fk_id", as: "examination" });
  Examination.hasMany(ExamStudent, { foreignKey: "exam_fk_id", as: "enrolledStudents" });

  ExamStudent.belongsTo(User, { foreignKey: "student_fk_id", as: "student" });
  User.hasMany(ExamStudent, { foreignKey: "student_fk_id", as: "enrollments" });

  // Note: JSONB lists like Examination.center_fk_list and SubjectPaper.paper_checkers_list 
  // are typically handled manually in application logic rather than by Sequelize associations.
};

export default setupAssociations;
