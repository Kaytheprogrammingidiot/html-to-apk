import { useState } from "react";

const allPermissions = [
  { name: "INTERNET", purpose: "Access the internet" },
  { name: "ACCESS_NETWORK_STATE", purpose: "Check network connectivity" },
  { name: "CAMERA", purpose: "Use the device camera" },
  { name: "RECORD_AUDIO", purpose: "Access microphone" },
  { name: "READ_EXTERNAL_STORAGE", purpose: "Read files from external storage" },
  { name: "WRITE_EXTERNAL_STORAGE", purpose: "Write files to external storage" },
  { name: "ACCESS_FINE_LOCATION", purpose: "Precise GPS location" },
  { name: "ACCESS_COARSE_LOCATION", purpose: "Approximate location" },
  { name: "BLUETOOTH", purpose: "Use Bluetooth" },
  { name: "BLUETOOTH_ADMIN", purpose: "Manage Bluetooth settings" },
  { name: "VIBRATE", purpose: "Control device vibration" },
  { name: "WAKE_LOCK", purpose: "Keep screen on" },
  { name: "READ_CONTACTS", purpose: "Access user contacts" },
  { name: "SEND_SMS", purpose: "Send SMS messages" },
  { name: "RECEIVE_SMS", purpose: "Receive SMS messages" },
  { name: "READ_PHONE_STATE", purpose: "Access phone status" },
];

export default function PermissionSelector({ onChange }) {
  const [selected, setSelected] = useState([]);

  const toggle = (perm) => {
    const updated = selected.includes(perm)
      ? selected.filter((p) => p !== perm)
      : [...selected, perm];
    setSelected(updated);
    onChange(updated.join(","));
  };

  return (
    <div>
      <h3>Select Permissions</h3>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Permission</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          {allPermissions.map(({ name, purpose }) => (
            <tr key={name}>
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(name)}
                  onChange={() => toggle(name)}
                />
              </td>
              <td><code>{name}</code></td>
              <td>{purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}