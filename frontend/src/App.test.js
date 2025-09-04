import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [data, setData] = useState([]);
  const [xKey, setXKey] = useState("");
  const [yKey, setYKey] = useState("");

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

  const chartData = {
    labels: data.map((row) => row[xKey]),
    datasets: [
      {
        label: yKey,
        data: data.map((row) => row[yKey]),
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Excel Data Analyzer 📊</h1>
      <input type="file" onChange={handleFileUpload} />

      {data.length > 0 && (
        <>
          <div>
            <label>X-Axis:</label>
            <select onChange={(e) => setXKey(e.target.value)}>
              <option value="">Select</option>
              {Object.keys(data[0]).map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>

            <label>Y-Axis:</label>
            <select onChange={(e) => setYKey(e.target.value)}>
              <option value="">Select</option>
              {Object.keys(data[0]).map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>

          {xKey && yKey && (
            <div style={{ width: "600px", marginTop: "20px" }}>
              <Bar data={chartData} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
