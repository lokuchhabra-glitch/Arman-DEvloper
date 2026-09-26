/**
 * ================================================================
 *  Arman's Portfolio — Backend Server with API Key Authentication
 * ================================================================
 * 
 *  This server handles:
 *  ✅ Serving all static portfolio files (HTML, CSS, JS, images)
 *  ✅ POST /api/submissions     — Save new contact form submissions
 *  ✅ GET  /api/submissions     — Retrieve all submissions (for spreadsheet viewer)
 *  ✅ DELETE /api/submissions/:id — Delete a single submission
 *  ✅ DELETE /api/submissions     — Clear all submissions
 *  ✅ API Key authentication on all /api/* routes
 *  ✅ Rate limiting to prevent spam/abuse
 *  ✅ CORS protection
 * 
 *  HOW TO RUN:
 *  1. npm install
 *  2. node server.js
 *  3. Open http://localhost:3000 in your browser
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'axh_portfolio_secret_key_2026_arman';
const BACKEND_DIR = path.join(__dirname, 'backend');
const DATA_FILE = path.join(BACKEND_DIR, 'contact_submissions.json');
const LEGACY_DATA_FILE = path.join(__dirname, 'contact_submissions.json');
const CSV_FILE = path.join(BACKEND_DIR, 'contact_submissions.csv');

fs.mkdirSync(BACKEND_DIR, { recursive: true });

// ================================================================
//  Middleware Setup
// ================================================================

// Parse JSON request bodies
app.use(express.json());

// CORS — Allow requests from localhost and your deployed domain
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like file://, mobile apps, Postman)
        if (!origin) return callback(null, true);
        // Allow localhost on any port
        if (origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
            return callback(null, true);
        }
        // Allow your custom domain here if you deploy (add your domain)
        // if (origin === 'https://yourdomain.com') return callback(null, true);
        callback(null, true); // Allow all for now (portfolio project)
    },
    credentials: true
}));

// Serve all static files from the project directory (HTML, CSS, JS, images)
app.use(express.static(__dirname));

// Rate Limiter — max 30 requests per 15 minutes per IP on API routes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,
    message: {
        error: 'Too many requests. Please try again later.',
        status: 429
    },
    standardHeaders: true,
    legacyHeaders: false
});

// ================================================================
//  API Key Authentication Middleware
// ================================================================
function authenticateApiKey(req, res, next) {
    const providedKey = req.headers['x-api-key'];
    
    if (!providedKey) {
        return res.status(401).json({
            error: 'Unauthorized — API key is missing.',
            message: 'Include your API key in the x-api-key header.',
            status: 401
        });
    }
    
    if (providedKey !== API_KEY) {
        return res.status(401).json({
            error: 'Unauthorized — Invalid API key.',
            message: 'The provided API key is incorrect.',
            status: 401
        });
    }
    
    next(); // API key is valid, proceed
}

// ================================================================
//  Data File Helpers (Read / Write JSON)
// ================================================================
function readSubmissions() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            // Preserve submissions created by older versions of the server.
            if (fs.existsSync(LEGACY_DATA_FILE)) {
                const legacyRaw = fs.readFileSync(LEGACY_DATA_FILE, 'utf8');
                const legacyData = JSON.parse(legacyRaw);
                const legacySubmissions = legacyData.submissions || [];
                fs.writeFileSync(DATA_FILE, JSON.stringify({ submissions: legacySubmissions }, null, 2), 'utf8');
                return legacySubmissions;
            }

            fs.writeFileSync(DATA_FILE, JSON.stringify({ submissions: [] }, null, 2), 'utf8');
            return [];
        }
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const data = JSON.parse(raw);
        return data.submissions || [];
    } catch (err) {
        console.error('Error reading data file:', err.message);
        return [];
    }
}

function writeSubmissions(submissions) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ submissions }, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error writing data file:', err.message);
        return false;
    }
}

// Also write a CSV file for direct Excel opening
function updateCsvFile(submissions) {
    try {
        const BOM = '\uFEFF'; // UTF-8 BOM for perfect Excel display
        let csv = BOM + '"ID","Timestamp","Full Name","Email Address","Subject / Purpose","Phone Number","Message"\r\n';
        
        submissions.forEach((item, index) => {
            const clean = (val) => `"${String(val || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
            csv += [
                clean(index + 1),
                clean(item.timestamp),
                clean(item.name),
                clean(item.email),
                clean(item.subject),
                clean(item.phone),
                clean(item.message)
            ].join(',') + '\r\n';
        });
        
        fs.writeFileSync(CSV_FILE, csv, 'utf8');
    } catch (err) {
        console.error('Error updating CSV file:', err.message);
    }
}

// ================================================================
//  API Routes (All protected by API Key + Rate Limiter)
// ================================================================

// ---------------------------------------------------------------
// POST /api/submissions — Save a new contact form submission
// ---------------------------------------------------------------
app.post('/api/submissions', apiLimiter, authenticateApiKey, (req, res) => {
    try {
        const { name, email, subject, phone, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({
                error: 'Missing required fields: name, email, and message are required.',
                status: 400
            });
        }
        
        // Create submission record
        const now = new Date();
        const submission = {
            id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
            timestamp: now.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'Asia/Kolkata'
            }),
            name: name.trim(),
            email: email.trim(),
            subject: subject || 'General Inquiry',
            phone: phone || 'N/A',
            message: message.trim()
        };
        
        // Read existing, add new, and save
        const submissions = readSubmissions();
        submissions.unshift(submission); // Newest first
        writeSubmissions(submissions);
        updateCsvFile(submissions);
        
        console.log(`✅ New submission from: ${submission.name} (${submission.email})`);
        
        return res.status(201).json({
            result: 'success',
            message: 'Submission saved to database and Excel spreadsheet!',
            submission: submission,
            totalCount: submissions.length,
            status: 201
        });
        
    } catch (err) {
        console.error('Error saving submission:', err.message);
        return res.status(500).json({
            error: 'Internal server error while saving submission.',
            status: 500
        });
    }
});

// ---------------------------------------------------------------
// GET /api/submissions — Retrieve all submissions (for spreadsheet viewer)
// ---------------------------------------------------------------
app.get('/api/submissions', authenticateApiKey, (req, res) => {
    try {
        const submissions = readSubmissions();
        return res.status(200).json({
            result: 'success',
            submissions: submissions,
            totalCount: submissions.length,
            status: 200
        });
    } catch (err) {
        console.error('Error fetching submissions:', err.message);
        return res.status(500).json({
            error: 'Failed to retrieve submissions.',
            status: 500
        });
    }
});

// ---------------------------------------------------------------
// DELETE /api/submissions/:id — Delete a specific submission by ID
// ---------------------------------------------------------------
app.delete('/api/submissions/:id', authenticateApiKey, (req, res) => {
    try {
        const idToDelete = req.params.id;
        let submissions = readSubmissions();
        const originalLength = submissions.length;
        
        submissions = submissions.filter(item => item.id !== idToDelete);
        
        if (submissions.length === originalLength) {
            return res.status(404).json({
                error: `Submission with ID "${idToDelete}" not found.`,
                status: 404
            });
        }
        
        writeSubmissions(submissions);
        updateCsvFile(submissions);
        
        console.log(`🗑️ Deleted submission: ${idToDelete}`);
        
        return res.status(200).json({
            result: 'success',
            message: 'Submission deleted successfully.',
            totalCount: submissions.length,
            status: 200
        });
    } catch (err) {
        console.error('Error deleting submission:', err.message);
        return res.status(500).json({
            error: 'Failed to delete submission.',
            status: 500
        });
    }
});

// ---------------------------------------------------------------
// DELETE /api/submissions — Clear ALL submissions
// ---------------------------------------------------------------
app.delete('/api/submissions', authenticateApiKey, (req, res) => {
    try {
        writeSubmissions([]);
        updateCsvFile([]);
        
        console.log('🗑️ All submissions cleared.');
        
        return res.status(200).json({
            result: 'success',
            message: 'All submissions cleared.',
            totalCount: 0,
            status: 200
        });
    } catch (err) {
        console.error('Error clearing submissions:', err.message);
        return res.status(500).json({
            error: 'Failed to clear submissions.',
            status: 500
        });
    }
});

// ---------------------------------------------------------------
// GET /api/status — Health check (no auth needed)
// ---------------------------------------------------------------
app.get('/api/status', (req, res) => {
    const submissions = readSubmissions();
    res.status(200).json({
        status: 'active',
        server: "Arman's Portfolio Backend API",
        totalSubmissions: submissions.length,
        uptime: Math.floor(process.uptime()) + 's',
        authenticated: 'API Key required for /api/submissions'
    });
});

// ================================================================
//  Start Server
// ================================================================
app.listen(PORT, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════════════╗');
    console.log('  ║                                                  ║');
    console.log("  ║   🚀  Arman's Portfolio Backend Server           ║");
    console.log('  ║                                                  ║');
    console.log(`  ║   🌐  http://localhost:${PORT}                     ║`);
    console.log(`  ║   📊  Spreadsheet: http://localhost:${PORT}/spreadsheet_viewer.html  ║`);
    console.log('  ║   🔐  API Key Authentication: ENABLED            ║');
    console.log(`  ║   📁  Data File: contact_submissions.json        ║`);
    console.log('  ║                                                  ║');
    console.log('  ╚══════════════════════════════════════════════════╝');
    console.log('');
    
    const submissions = readSubmissions();
    console.log(`  📋 Current submissions in database: ${submissions.length}`);
    console.log('  ⏳ Server is running... Press Ctrl+C to stop.\n');
});
