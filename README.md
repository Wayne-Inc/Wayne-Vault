# 🔐 WAYNE VAULT
**Wayne Vault** is a terminal-inspired local storage system. It allows for secure file transfers and system monitoring across your local network.

---

### 📥 LOCAL INSTALLATION PROTOCOL

#### **Method A: The Release (Recommended)**
1. Go to the [Releases](https://github.com/samwelwayne266-coder/wayne-vault/releases) section on the right side of this page.
2. Download the latest `Source code (zip)`.
3. Extract the folder to your desired directory.

#### **Method B: Manual Download**
1. Click the green **Code** button at the top of this repository.
2. Select **Download ZIP**.
3. Extract the contents to your machine.

---

### ⚙️ SYSTEM SETUP

1. **Install Dependencies:**
   Open your terminal in the extracted folder and run:
   ```bash
   npm install
   ```
2. Initialize the Vault:

   ```bash
   npm start
   ```

Establish Connection: Once the terminal says WAYNE_CORE // SYSTEM_READY, you can access the vault:

On the PC: ```Open http://localhost:3000```

On Other Devices (Phones/Tablets): 

   1. Find your Local IP (Type ipconfig in CMD on Windows or ifconfig on Linux). 

   2. Open the browser on your other device and type: http://YOUR_LOCAL_IP:3000 (e.g., http://192.168.1.5:3000).
      
**🛡️ ACCESS KEYS**

The system is protected by a Gatekeeper. You must enter the identity-verified code to bypass the encryption:

   SECRET_CODE: **```WAYNE```**

**💎 FEATURES**

📊 Live Telemetry: Real-time monitoring of CPU/RAM.

💀 Data Shredder: Overwrites bytes before deletion.

🚀 Universal Access: Fully responsive for mobile and desktop browsers.
