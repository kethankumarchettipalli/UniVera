// exportCollegesToTXT.js
const fs = require("fs");
const admin = require("firebase-admin");

// Load the service account key JSON placed in the same folder
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function exportCollegesToTXT() {
  try {
    const snapshot = await db.collection("colleges").get();
    if (snapshot.empty) {
      console.log("No colleges found in the 'colleges' collection.");
      return;
    }

    // Extract names: filter out docs without a name or where name is falsy
    const names = snapshot.docs
      .map(doc => {
        const data = doc.data();
        // prefer name field; fall back to title or displayName if you used different property names
        return data && (data.name || data.title || data.displayName) ? String(data.name || data.title || data.displayName).trim() : null;
      })
      .filter(Boolean); // remove null/empty

    if (names.length === 0) {
      console.log("No name fields found in the college documents.");
      return;
    }

    // Join with newline and write file in the current folder
    fs.writeFileSync("colleges.txt", names.join("\n"), { encoding: "utf8" });

    console.log(`✅ Exported ${names.length} college names to colleges.txt`);
  } catch (err) {
    console.error("Error exporting colleges:", err);
  }
}

exportCollegesToTXT();
