const { useState } = React;

// ---- Student data (pre-populated) ----
const STUDENTS = [
  { id: 1, name: 'Kasun Perera',     course: 'AI & Modern Tech', grade: 'A' },
  { id: 2, name: 'Nimali Silva',     course: 'Web Development',  grade: 'B' },
  { id: 3, name: 'Tharindu Bandara', course: 'AI & Modern Tech', grade: 'A' },
  { id: 4, name: 'Sachini Fernando', course: 'Data Science',     grade: 'C' },
  { id: 5, name: 'Dilshan Jayasinghe', course: 'Web Development', grade: 'A' },
  { id: 6, name: 'Ishara Kumari',   course: 'Data Science',     grade: 'B' },
  { id: 7, name: 'Ravindu Lakmal',  course: 'AI & Modern Tech', grade: 'C' },
  { id: 8, name: 'Malini Dissanayake', course: 'Web Development', grade: 'B' }
];

// ---- StudentCard Component (Child) ----
function StudentCard({ student }) {
  // Grade badge color
  const gradeColor = {
    'A': 'bg-teal-500/20 text-teal-400',
    'B': 'bg-blue-500/20 text-blue-400',
    'C': 'bg-yellow-500/20 text-yellow-400'
  };

  return (
    <div className="bg-slate-700 rounded-xl p-4 border border-slate-600
                    hover:border-teal-500/30 transition duration-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-white">{student.name}</h3>
        <span className={`text-xs px-2 py-1 rounded-lg font-bold
                         ${gradeColor[student.grade] || 'bg-slate-600 text-slate-300'}`}>
          Grade {student.grade}
        </span>
      </div>
      <p className="text-slate-400 text-sm">📚 {student.course}</p>
    </div>
  );
}

// ---- Main App Component ----
function StudentListApp() {
  // State: search query + grade filter
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');

  // ---- Filter logic (derived state — store නොකර calculate කරනවා) ----
  const filteredStudents = STUDENTS.filter(student => {
    // Name search — case insensitive
    const matchesSearch = student.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Grade filter — "All" selected නම් ඔක්කොම show කරනවා
    const matchesGrade = gradeFilter === 'All' || student.grade === gradeFilter;

    // Both conditions match විය යුතුයි
    return matchesSearch && matchesGrade;
  });

  // Unique grades for dropdown
  const grades = ['All', ...new Set(STUDENTS.map(s => s.grade))];

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-teal-400 text-center mb-8">
          🎓 Student Directory
        </h1>

        {/* Search & Filter Bar */}
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-xl
                         border border-slate-600 focus:border-teal-500
                         focus:outline-none transition"
            />

            {/* Grade Filter Dropdown */}
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="bg-slate-700 text-white px-4 py-2 rounded-xl
                         border border-slate-600 focus:border-teal-500
                         focus:outline-none transition cursor-pointer">
              {grades.map(grade => (
                <option key={grade} value={grade}>
                  {grade === 'All' ? 'All Grades' : `Grade ${grade}`}
                </option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <p className="text-slate-500 text-xs mt-3">
            Showing {filteredStudents.length} of {STUDENTS.length} students
          </p>
        </div>

        {/* Student List */}
        <div className="space-y-3">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">🔍 No students found</p>
              <p className="text-slate-600 text-sm mt-1">
                Try a different search or filter
              </p>
            </div>
          ) : (
            filteredStudents.map(student => (
              <StudentCard key={student.id} student={student} />
            ))
          )}
        </div>

        {/* Summary Stats */}
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 mt-6">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-2xl font-bold text-teal-400">
                {STUDENTS.filter(s => s.grade === 'A').length}
              </p>
              <p className="text-slate-500 text-xs">Grade A</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">
                {STUDENTS.filter(s => s.grade === 'B').length}
              </p>
              <p className="text-slate-500 text-xs">Grade B</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">
                {STUDENTS.filter(s => s.grade === 'C').length}
              </p>
              <p className="text-slate-500 text-xs">Grade C</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {STUDENTS.length}
              </p>
              <p className="text-slate-500 text-xs">Total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<StudentListApp />);