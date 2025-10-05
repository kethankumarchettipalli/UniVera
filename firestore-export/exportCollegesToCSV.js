// exportCollegesToCSV.js
const fs = require("fs");
const admin = require("firebase-admin");

// Load service account JSON in same folder
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// safe CSV cell generator: wraps in quotes and escapes " by doubling ""
function csvCell(value) {
  if (value === undefined || value === null) return '""';
  const s = String(value);
  // escape double quotes by doubling them
  const escaped = s.replace(/"/g, '""');
  return `"${escaped}"`;
}

async function exportCollegesToCSV() {
  try {
    const snapshot = await db.collection("colleges").get();
    if (snapshot.empty) {
      console.log("No documents found in the 'colleges' collection.");
      return;
    }

    // Map docs to plain objects
    const colleges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Choose which fields to include in CSV and their order.
    // Edit this array if you want other fields (e.g., "phone", "website", "city")
    const fields = ["id", "name", "city", "website"];

    // Build header row
    const header = fields.join(",");

    // Build rows
    const rows = colleges.map(c => {
      return fields.map(f => {
        // try a few field name variants if your docs use different keys
        const value = c[f] ?? c[f.toLowerCase()] ?? c[f.toUpperCase()] ?? "";
        return csvCell(value);
      }).join(",");
    });

    // Combine and write file
    const csvContent = [header, ...rows].join("\n");
    fs.writeFileSync("colleges.csv", csvContent, { encoding: "utf8" });

    console.log(`✅ Exported ${colleges.length} colleges to colleges.csv`);
  } catch (err) {
    console.error("Error exporting to CSV:", err);
  }
}

exportCollegesToCSV();
