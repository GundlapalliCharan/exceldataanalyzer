import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import axios from "axios";
import { Bar, Pie, Scatter } from "react-chartjs-2";
import jsPDF from "jspdf";
import { useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);


function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    await axios.post("https://backend-pq33.onrender.com/signup", { username, password });
    alert("Signup successful! Please login.");
    navigate("/login");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Signup</h2>
      <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} /><br />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} /><br />
      <button onClick={handleSignup}>Signup</button>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}

function Login({ setUserId }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await axios.post("https://backend-pq33.onrender.com/login", { username, password });
    if (res.data.success) {
      setUserId(res.data.userId);
      navigate("/dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="glass-box">
      <h2>Login</h2>
      <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <p className="text-sm text-gray-300 mt-3">
        New user? <Link to="/signup">Signup</Link>
      </p>
    </div>
  );
}


function Analyzer({ userId }) {
  const [data, setData] = useState([]);
  const [xKey, setXKey] = useState("");
  const [yKey, setYKey] = useState("");
  const [chartType, setChartType] = useState("Bar");
  const chartRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const wb = XLSX.read(event.target.result, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const json = XLSX.utils.sheet_to_json(ws);
      setData(json);
    };
    reader.readAsBinaryString(file);
  };

  const saveHistory = async () => {
    await axios.post("https://backend-pq33.onrender.com/history", {
      userId,
      fileName: "UploadedFile.xlsx",
      chartType,
      xAxis: xKey,
      yAxis: yKey,
    });
    alert("History saved!");
  };

  const chartData = {
    labels: data.map((row) => row[xKey]),
    datasets: [
      {
        label: yKey,
        data: data.map((row) => row[yKey]),
        backgroundColor: [
          "rgba(59,130,246,0.7)",
          "rgba(236,72,153,0.7)",
          "rgba(34,197,94,0.7)",
          "rgba(249,115,22,0.7)",
          "rgba(139,92,246,0.7)",
        ],
      },
    ],
  };

  const scatterData = {
    datasets: [
      {
        label: `${xKey} vs ${yKey}`,
        data: data.map((row) => ({
          x: row[xKey],
          y: row[yKey],
        })),
        backgroundColor: "rgba(59,130,246,0.7)",
      },
    ],
  };

  const downloadPNG = () => {
    const chart = chartRef.current;
    if (chart) {
      const url = chart.toBase64Image("image/png", 1.0);
      const link = document.createElement("a");
      link.href = url;
      link.download = "chart.png";
      link.click();
    }
  };

  const downloadPDF = () => {
    const chart = chartRef.current;
    if (chart) {
      const url = chart.toBase64Image("image/png", 1.0);
      const pdf = new jsPDF();
      pdf.text("Excel Data Analysis", 20, 20);
      pdf.addImage(url, "PNG", 15, 40, 180, 100);
      pdf.save("chart.pdf");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center text-white">
      <div className="glass-box max-w-3xl w-full">
        <h2 className="text-2xl font-bold mb-6 text-indigo-300">Excel Data Analyzer 📊</h2>
        <input type="file" onChange={handleFileUpload} className="mb-6 text-white" />

        {data.length > 0 && (
          <>
            <div className="flex gap-6 mb-6 justify-center flex-wrap">
              <div className="flex flex-col">
                <label className="text-lg font-semibold text-pink-400 mb-2">X-Axis</label>
                <select
                  onChange={(e) => setXKey(e.target.value)}
                  className="p-2 rounded-lg bg-gray-700 text-white"
                >
                  <option value="">Select</option>
                  {Object.keys(data[0]).map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-lg font-semibold text-green-400 mb-2">Y-Axis</label>
                <select
                  onChange={(e) => setYKey(e.target.value)}
                  className="p-2 rounded-lg bg-gray-700 text-white"
                >
                  <option value="">Select</option>
                  {Object.keys(data[0]).map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-lg font-semibold text-indigo-400 mb-2">Chart Type</label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="p-2 rounded-lg bg-gray-700 text-white"
                >
                  <option value="Bar">Bar</option>
                  <option value="Pie">Pie</option>
                  <option value="Scatter">Scatter</option>
                  {/* Future: 3D option with Three.js */}
                </select>
              </div>
            </div>

            {xKey && yKey && (
              <div className="w-full max-w-2xl mx-auto">
                {chartType === "Bar" && (
                  <Bar ref={chartRef} data={chartData} />
                )}
                {chartType === "Pie" && (
                  <Pie ref={chartRef} data={chartData} />
                )}
                {chartType === "Scatter" && (
                  <Scatter ref={chartRef} data={scatterData} />
                )}

                <div className="flex gap-4 mt-6 justify-center flex-wrap">
                  <button
                    onClick={downloadPNG}
                    className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg"
                  >
                    Download PNG
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={saveHistory}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
                  >
                    Save to History
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


function Dashboard({ userId }) {
  const [history, setHistory] = useState([]);

  React.useEffect(() => {
    axios.get(`https://backend-pq33.onrender.com/history/${userId}`).then((res) => {
      setHistory(res.data);
    });
  }, [userId]);

  return (
  <div class="min-h-screen w-full text-white flex items-center justify-center">
      {/* Transparent Center Box */}
      <div className="glass-box max-w-2xl w-full">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-indigo-300 mb-4">📊 Dashboard</h2>

        {/* Button under heading */}
        <div className="mb-6">
          <Link
            to="/analyzer"
            className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-lg font-semibold transition"
          >
            + New Analysis
          </Link>
        </div>

        {/* History Section */}
        {history.length === 0 ? (
          <p className="text-gray-400">No analysis saved yet.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((h, index) => (
              <li
                key={index}
                className="p-3 bg-slate-700/70 rounded-lg shadow-md flex justify-between items-center hover:bg-slate-700 transition"
              >
                <div className="text-left">
                  <p className="font-semibold text-indigo-300">{h.fileName}</p>
                  <p className="text-sm text-gray-300">
                    {h.chartType} → {h.xAxis} vs {h.yAxis}
                  </p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-indigo-500/80">
                  {new Date(h.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}




function App() {
  const [userId, setUserId] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setUserId={setUserId} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login setUserId={setUserId} />} />
        <Route path="/dashboard" element={<Dashboard userId={userId} />} />
        <Route path="/analyzer" element={<Analyzer userId={userId} />} />
      </Routes>
    </Router>
  );
}

export default App;
