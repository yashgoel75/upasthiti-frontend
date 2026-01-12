"use client";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

const BRANCHES = [
  "AIML",
  "AIDS",
  "CSE",
  "CSE-AM",
  "VLSI",
  "IIOT",
  "CSE-Cyber Security",
];

export default function TimeTable() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [timetables, setTimetables] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [addTimeTable, setAddTimeTable] = useState(false);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/admin/timetables`
      );
      const data = await res.json();
      setTimetables(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const uploadTimeTableCSV = async (file: File) => {
    const formData = new FormData();
    formData.append("csvFile", file);
    formData.append("validFrom", "2027-01-01");
    formData.append("validUntil", "2028-01-01");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/admin/timetables/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    return res.json();
  };

  const handleUpload = async () => {
    if (!csvFile) return;

    setUploading(true);
    try {
      await uploadTimeTableCSV(csvFile);
      await fetchTimetable();
    } finally {
      setUploading(false);
    }
  };

  const grouped = timetables.reduce((acc: any, tt) => {
    if (!acc[tt.department]) acc[tt.department] = {};
    if (!acc[tt.department][tt.section]) acc[tt.department][tt.section] = [];
    acc[tt.department][tt.section].push(tt);
    return acc;
  }, {});

  const DaySchedule = ({ day, periods }: any) => {
    if (!periods || periods.length === 0)
      return <p className="text-sm text-gray-700">No classes</p>;

    return (
      <table className="w-full text-sm border-collapse mb-4">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 dark:text-gray-200">
            <th className="p-2 border">Period</th>
            <th className="p-2 border">Time</th>
            <th className="p-2 border">Subject</th>
            <th className="p-2 border">Teacher</th>
            <th className="p-2 border">Room</th>
            <th className="p-2 border">Type</th>
          </tr>
        </thead>
        <tbody>
          {periods.map((p: any, idx: number) => (
            <tr key={idx} className="dark:text-gray-800">
              <td className="border p-2">{p.period}</td>
              <td className="border p-2">{p.time}</td>

              {/* Subject column */}
              <td className="border p-2">
                {p.type === "lunch" && "LUNCH"}
                {p.type === "class" && p.subjectName}
                {p.type === "lab" &&
                  (p.isGroupSplit
                    ? "Lab (Group Split)"
                    : p.subjectName ?? "Lab")}
                {p.type === "library" && "Library"}
                {p.type === "mentorship" && "Mentorship"}

                {/* Group split details */}
                {p.isGroupSplit && p.groups && (
                  <div className="text-xs mt-1 text-blue-600">
                    Group 1: {p.groups.group1.subjectName} <br />
                    Group 2: {p.groups.group2.subjectName}
                  </div>
                )}
              </td>

              {/* Teacher column */}
              <td className="border p-2">
                {p.teacherName ??
                  p.groups?.group1?.teacherName ??
                  p.groups?.group2?.teacherName ??
                  "-"}
              </td>

              {/* Room */}
              <td className="border p-2">
                {p.room ??
                  p.groups?.group1?.room ??
                  p.groups?.group2?.room ??
                  "-"}
              </td>

              {/* Type */}
              <td className="border p-2 capitalize">{p.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return (
    <div
      className={`min-h-screen p-6 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <h1
          className={`text-3xl font-bold mb-3 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Time Table Management
        </h1>

        <div className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="Search teacher or subject..."
            className="w-full border rounded-lg px-4 py-2"
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button
            onClick={() => setAddTimeTable(!addTimeTable)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            + Upload Timetable
          </button>
        </div>

        {addTimeTable && (
          <div
            className={`p-6 rounded-xl mb-10 border ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-300"
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            />

            <button
              onClick={handleUpload}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              {uploading ? "Uploading..." : "Upload CSV"}
            </button>
          </div>
        )}

        {Object.entries(grouped).map(([dept, sections]: any) => (
          <div key={dept} className="mb-10">
            <h2 className="text-2xl font-bold text-red-600 mb-4">{dept}</h2>

            {Object.entries(sections).map(([section, arr]: any) =>
              arr.map((tt: any) => (
                <div key={tt._id} className="mb-8 p-6 bg-white rounded-xl">
                  <h3 className="text-xl font-semibold mb-2">
                    Section {section} — Semester {tt.semester}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4">
                    Valid: {new Date(tt.validFrom).toDateString()} →{" "}
                    {new Date(tt.validUntil).toDateString()}
                  </p>

                  {days.map((day) => (
                    <div key={day} className="mb-6">
                      <h4 className="text-lg font-medium capitalize mb-2">
                        {day}
                      </h4>
                      <DaySchedule day={day} periods={tt.weekSchedule[day]} />
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
