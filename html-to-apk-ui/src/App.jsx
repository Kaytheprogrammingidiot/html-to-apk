import { useState } from "react";
import PermissionSelector from "./PermissionSelector";

function App() {
  const [permissions, setPermissions] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    formData.append("permissions", permissions);

    const res = await fetch("http://localhost:3000/api/build-apk", {
      method: "POST",
      body: formData,
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "custom-app.apk";
    a.click();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Kay's HTML to APK Builder</h1>
      <p>HTML File or ZIP Archive</p>
      <input type="file" name="htmlZip" accept=".html,.zip" required />
      <p>App Icon (PNG)</p>
      <input type="file" name="icon" accept="image/png" required />
      <p>App Name</p>
      <input type="text" name="appName" placeholder="App Name" required />
      <p>Package Name</p>
      <input type="text" name="packageName" placeholder="com.company.app" required />
      <p>Version Number (e.g., 1.0.0)</p>
      <input type="text" name="versionName" placeholder="1.0.0" required />
      <PermissionSelector onChange={setPermissions} />
      <button type="submit">Build APK</button>
    </form>
  );
}

export default App;