const path = require("path");
const dns = require("dns");
const { MongoClient, ServerApiVersion } = require("mongodb");
const mongoose = require("mongoose");

// Force IPv4 and set reliable Google/Cloudflare DNS servers for c-ares resolver
try {
    dns.setDefaultResultOrder("ipv4first");
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {
    // Ignore if not supported
}

// Load environment variables from server/.env
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const uri = process.env.MONGODB_URI;

function sanitizeUri(str) {
    if (!str) return "UNDEFINED";
    return str.replace(/\/\/(.*):(.*)@/, "//***:***@");
}

function printDnsSuggestions() {
    console.log("\n--------------------------------------------------");
    console.log(" TROUBLESHOOTING & RECOMMENDATIONS:");
    console.log("--------------------------------------------------");
    console.log("1. Check Internet & Local Router Connection");
    console.log("2. Check MongoDB Atlas IP Access List (Whitelist):");
    console.log("   - Log in to https://cloud.mongodb.com");
    console.log("   - Navigate to Network Access -> IP Access List");
    console.log("   - Add '0.0.0.0/0' (Allow Access from Anywhere) or your current IP");
    console.log("3. Try Changing DNS Servers on your Machine:");
    console.log("   - Preferred DNS: 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare)");
    console.log("   - Alternate DNS: 8.8.4.4 (Google) or 1.0.0.1 (Cloudflare)");
    console.log("4. Flush DNS Cache (Windows Command Prompt):");
    console.log("   - Run: ipconfig /flushdns");
    console.log("--------------------------------------------------\n");
}

function diagnoseError(err) {
    const msg = err ? err.message || String(err) : "";
    const code = err ? err.code || "" : "";

    console.log(`\n[Diagnostic Log] Error Code: ${code || "N/A"}`);
    console.log(`[Diagnostic Log] Details   : ${msg}`);

    if (msg.includes("querySrv ECONNREFUSED") || msg.includes("ENOTFOUND") || msg.includes("querySrv EREFUSED")) {
        console.log("\nRoot Cause: DNS SRV Lookup Failure.");
        console.log("Explanation: Your local DNS resolver or ISP network is blocking SRV record resolution for MongoDB Atlas.");
        printDnsSuggestions();
    } else if (msg.includes("bad auth") || msg.includes("Authentication failed") || msg.includes("auth failed")) {
        console.log("\nRoot Cause: Authentication Failure.");
        console.log("Explanation: The username or password in MONGODB_URI is invalid. Verify Database Access credentials in MongoDB Atlas.");
    } else if (msg.includes("MongoServerSelectionError") || msg.includes("selection timed out")) {
        console.log("\nRoot Cause: Atlas IP Access List / Firewall Block.");
        console.log("Explanation: MongoDB Atlas cluster is unreachable. Your current IP address is likely not in the Atlas Network Access Whitelist, or port 27017 is blocked by a firewall.");
        printDnsSuggestions();
    } else if (msg.includes("ETIMEDOUT") || msg.includes("connect ETIMEDOUT")) {
        console.log("\nRoot Cause: Network Connection Timeout.");
        console.log("Explanation: Connection attempt timed out before reaching Atlas servers.");
        printDnsSuggestions();
    } else if (msg.includes("SSL") || msg.includes("tls") || msg.includes("certificate")) {
        console.log("\nRoot Cause: SSL/TLS Handshake Error.");
        console.log("Explanation: Secure connection failed. Verify system clock and network proxy settings.");
    } else {
        console.log(`\nRoot Cause: Unspecified Error (${msg})`);
        printDnsSuggestions();
    }
}

async function testNativeDriver(connectionUri) {
    console.log("\n==================================================");
    console.log(" 1. TESTING NATIVE MONGODB DRIVER (MongoClient)");
    console.log("==================================================");
    console.log(`Connecting to: ${sanitizeUri(connectionUri)}`);

    const client = new MongoClient(connectionUri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true
        },
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000
    });

    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("✓ Native Driver Connected");
        return { success: true };
    } catch (err) {
        console.log("✗ Native Driver Failed");
        diagnoseError(err);
        return { success: false, error: err };
    } finally {
        try {
            await client.close();
        } catch {
            // Ignore close error
        }
    }
}

async function testMongooseDriver(connectionUri) {
    console.log("==================================================");
    console.log(" 2. TESTING MONGOOSE DRIVER (mongoose.connect)");
    console.log("==================================================");
    console.log(`Connecting to: ${sanitizeUri(connectionUri)}`);

    try {
        await mongoose.connect(connectionUri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4
        });
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("✓ Mongoose Connected");
        return { success: true };
    } catch (err) {
        console.log("✗ Mongoose Failed");
        diagnoseError(err);
        return { success: false, error: err };
    } finally {
        try {
            await mongoose.disconnect();
        } catch {
            // Ignore disconnect error
        }
    }
}

async function main() {
    console.log("\n==================================================");
    console.log(" AETHER AI - MONGODB ATLAS DIAGNOSTIC TOOL");
    console.log("==================================================");

    if (!uri) {
        console.error("CRITICAL ERROR: MONGODB_URI is not defined in process.env / server/.env");
        process.exit(1);
    }

    const nativeResult = await testNativeDriver(uri);
    const mongooseResult = await testMongooseDriver(uri);

    console.log("==================================================");
    console.log(" DIAGNOSTIC SUMMARY");
    console.log("==================================================");
    console.log(nativeResult.success ? "✓ Native Driver Connected" : "✗ Native Driver Failed");
    console.log(mongooseResult.success ? "✓ Mongoose Connected" : "✗ Mongoose Failed");
    console.log("==================================================");

    if (nativeResult.success && mongooseResult.success) {
        console.log("\nRESULT: Both Native Driver and Mongoose connected to MongoDB Atlas successfully!");
        console.log("No configuration issues detected. Mongoose architecture is 100% operational.");
    } else if (nativeResult.success && !mongooseResult.success) {
        console.log("\nRESULT: Native Driver connected, but Mongoose failed.");
        console.log("Recommended Fix: Align Mongoose connection options with Native Driver parameters.");
    } else if (!nativeResult.success && mongooseResult.success) {
        console.log("\nRESULT: Mongoose connected, but Native Driver failed.");
    } else {
        console.log("\nRESULT: Both Native Driver and Mongoose failed to connect to Atlas.");
        console.log("Root Cause: Network, DNS SRV lookup, or Atlas IP Whitelist restriction.");
        console.log("Action: Follow the troubleshooting steps above (IP Whitelist '0.0.0.0/0', Google DNS 8.8.8.8, ipconfig /flushdns).");
    }

    console.log("\nDiagnostic complete.\n");
    process.exit(0);
}

main();
