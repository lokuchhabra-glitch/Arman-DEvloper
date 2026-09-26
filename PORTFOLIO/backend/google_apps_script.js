/**
 * Google Apps Script — Portfolio Contact Form → Gmail Email + Sheet Backup
 * 
 * ═══════════════════════════════════════════════════════════
 *  WHEN SOMEONE SENDS YOU A MESSAGE ON YOUR PORTFOLIO,
 *  YOU WILL RECEIVE IT DIRECTLY IN YOUR GMAIL INBOX! 📧
 * ═══════════════════════════════════════════════════════════
 * 
 * HOW TO SET UP (2 MINUTES — ONE TIME ONLY):
 * 
 * 1. Open https://sheets.new → Creates a new Google Sheet.
 * 2. Name the sheet "Portfolio Messages" (or anything you like).
 * 3. Click Extensions → Apps Script (in the top menu).
 * 4. Delete ALL code in the editor, and PASTE this entire file.
 * 5. ⚠️ IMPORTANT: Change YOUR_EMAIL below to your real Gmail address!
 * 6. Click "Deploy" (blue button, top right) → "New deployment".
 * 7. Click the ⚙️ gear icon → Select "Web app".
 * 8. Set:
 *    - Description: "Portfolio Contact Form"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"  ← THIS IS REQUIRED
 * 9. Click "Deploy", then authorize permissions when asked.
 * 10. Copy the generated Web App URL (looks like: https://script.google.com/.../exec)
 * 11. Paste that URL in your index.html where it says GOOGLE_APPS_SCRIPT_URL
 * 
 * DONE! ✅ Now every form submission will:
 *   → Send you a nicely formatted EMAIL on Gmail
 *   → Save the data in Google Sheet (like Excel backup)
 */

// ═══════════════════════════════════════
// ⬇️ CHANGE THIS TO YOUR GMAIL ADDRESS ⬇️
// ═══════════════════════════════════════
const YOUR_EMAIL = "lokuchhabra@gmail.com";
// ═══════════════════════════════════════

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    // Parse the incoming form data
    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    var name = data.name || "Unknown";
    var email = data.email || "No email";
    var subject = data.subject || "General Inquiry";
    var phone = data.phone || "Not provided";
    var message = data.message || "No message";
    var timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

    // ═══════════════════════════════════
    // 1. SEND EMAIL TO YOUR GMAIL 📧
    // ═══════════════════════════════════
    var emailSubject = "🚀 New Portfolio Message: " + subject + " — from " + name;
    
    var emailBody = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                    "  📩 NEW MESSAGE FROM YOUR PORTFOLIO\n" +
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                    "👤 Name:      " + name + "\n" +
                    "📧 Email:     " + email + "\n" +
                    "📞 Phone:     " + phone + "\n" +
                    "📋 Subject:   " + subject + "\n" +
                    "🕐 Sent at:   " + timestamp + "\n\n" +
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                    "  💬 MESSAGE:\n" +
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                    message + "\n\n" +
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                    "💡 Reply directly to this email to respond to " + name + "\n" +
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    
    // HTML version for a nicer looking email
    var htmlBody = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
      '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">' +
        '<h2 style="margin: 0; font-size: 22px;">📩 New Portfolio Message</h2>' +
        '<p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Someone contacted you through your portfolio!</p>' +
      '</div>' +
      '<div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0;">' +
        '<table style="width: 100%; border-collapse: collapse;">' +
          '<tr><td style="padding: 10px 12px; color: #64748b; font-size: 13px; width: 100px;">👤 Name</td><td style="padding: 10px 12px; font-weight: bold; color: #1e293b;">' + name + '</td></tr>' +
          '<tr style="background: white;"><td style="padding: 10px 12px; color: #64748b; font-size: 13px;">📧 Email</td><td style="padding: 10px 12px;"><a href="mailto:' + email + '" style="color: #667eea; text-decoration: none;">' + email + '</a></td></tr>' +
          '<tr><td style="padding: 10px 12px; color: #64748b; font-size: 13px;">📞 Phone</td><td style="padding: 10px 12px; color: #1e293b;">' + phone + '</td></tr>' +
          '<tr style="background: white;"><td style="padding: 10px 12px; color: #64748b; font-size: 13px;">📋 Subject</td><td style="padding: 10px 12px; color: #1e293b; font-weight: 600;">' + subject + '</td></tr>' +
          '<tr><td style="padding: 10px 12px; color: #64748b; font-size: 13px;">🕐 Time</td><td style="padding: 10px 12px; color: #1e293b;">' + timestamp + '</td></tr>' +
        '</table>' +
      '</div>' +
      '<div style="background: white; padding: 20px 24px; border: 1px solid #e2e8f0; border-top: none;">' +
        '<p style="color: #64748b; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Message</p>' +
        '<div style="background: #f1f5f9; padding: 16px; border-radius: 8px; border-left: 4px solid #667eea; color: #334155; line-height: 1.6;">' + message.replace(/\n/g, '<br>') + '</div>' +
      '</div>' +
      '<div style="background: #1e293b; color: #94a3b8; padding: 16px 24px; border-radius: 0 0 12px 12px; text-align: center; font-size: 13px;">' +
        '💡 Reply directly to respond to <strong style="color: #e2e8f0;">' + name + '</strong> at <a href="mailto:' + email + '" style="color: #667eea;">' + email + '</a>' +
      '</div>' +
    '</div>';

    GmailApp.sendEmail(YOUR_EMAIL, emailSubject, emailBody, {
      htmlBody: htmlBody,
      replyTo: email,  // When you hit "Reply", it goes directly to the sender!
      name: "Portfolio Contact Form"
    });

    // ═══════════════════════════════════
    // 2. SAVE TO GOOGLE SHEET (BACKUP) 📊
    // ═══════════════════════════════════
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName('Sheet1') || doc.getActiveSheet();

    // Create header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Full Name", "Email Address", "Subject", "Phone", "Message", "Email Sent?"]);
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([timestamp, name, email, subject, phone, message, "✅ Yes"]);

    return ContentService
      .createTextOutput(JSON.stringify({
        "result": "success",
        "status": 200,
        "message": "Email sent to your Gmail + saved to Sheet!"
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        "result": "error",
        "error": error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      "status": "active",
      "message": "Portfolio Contact API is running. Messages will be emailed to your Gmail!"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
