import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Email endpoint
  app.post("/api/send-confirmation", async (req, res) => {
    const { email, eventTitle, userName, status, dateTime, location } = req.body;

    if (!email || !eventTitle) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // SMTP Configuration
    // Users need to provide these in their environment
    const transporterConfig: any = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    // If service is provided (e.g., 'gmail'), use it as it's often more reliable
    if (process.env.SMTP_SERVICE) {
      transporterConfig.service = process.env.SMTP_SERVICE;
      // When using 'service', host/port/secure are handled automatically by nodemailer
      delete transporterConfig.host;
      delete transporterConfig.port;
      delete transporterConfig.secure;
    } else if (process.env.SMTP_HOST?.includes('gmail.com')) {
      // Auto-detect Gmail and use the service configuration
      transporterConfig.service = 'gmail';
      delete transporterConfig.host;
      delete transporterConfig.port;
      delete transporterConfig.secure;
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    const mailOptions = {
      from: `"GeeksForGeeks Club" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Registration Confirmed: ${eventTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #16a34a; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0;">Registration Confirmed!</h1>
          </div>
          <div style="padding: 24px;">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>You have successfully registered for <strong>${eventTitle}</strong>.</p>
            <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Event Details:</h3>
              <p style="margin: 4px 0;"><strong>Status:</strong> ${status}</p>
              <p style="margin: 4px 0;"><strong>Date:</strong> ${dateTime}</p>
              <p style="margin: 4px 0;"><strong>Location:</strong> ${location || 'To be announced'}</p>
            </div>
            <p>We look forward to seeing you there!</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="font-size: 12px; color: #6b7280; text-align: center;">
              This is an automated message from the GeeksForGeeks Student Chapter.
            </p>
          </div>
        </div>
      `,
    };

    try {
      // Only attempt to send if SMTP is configured
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Email sent" });
      } else {
        console.warn("SMTP not configured. Skipping email send.");
        res.json({ success: true, message: "SMTP not configured, skipping email" });
      }
    } catch (error: any) {
      if (error.code === 'EAUTH' || error.responseCode === 535) {
        console.error("SMTP Authentication Failed: The username or password was rejected.");
        console.error("TIP: If using Gmail, ensure you are using an 'App Password', not your regular account password.");
        console.error("Visit: https://myaccount.google.com/apppasswords to generate one.");
        res.status(401).json({ 
          error: "SMTP Authentication Failed", 
          details: "Invalid credentials. If using Gmail, an App Password is required." 
        });
      } else {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email", details: error.message });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Test Email endpoint
  app.post("/api/test-email", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const transporterConfig: any = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    if (process.env.SMTP_SERVICE) {
      transporterConfig.service = process.env.SMTP_SERVICE;
      delete transporterConfig.host;
      delete transporterConfig.port;
      delete transporterConfig.secure;
    } else if (process.env.SMTP_HOST?.includes('gmail.com')) {
      transporterConfig.service = 'gmail';
      delete transporterConfig.host;
      delete transporterConfig.port;
      delete transporterConfig.secure;
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    try {
      await transporter.sendMail({
        from: `"GeeksForGeeks Club" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "SMTP Test Email",
        text: "This is a test email to verify your SMTP settings. If you received this, your email configuration is working correctly!",
        html: "<h1>SMTP Test Successful!</h1><p>This is a test email to verify your SMTP settings. If you received this, your email configuration is working correctly!</p>"
      });
      res.json({ success: true, message: "Test email sent successfully" });
    } catch (error: any) {
      console.error("SMTP Test Failed:", error);
      res.status(500).json({ 
        error: "SMTP Test Failed", 
        details: error.message,
        code: error.code,
        responseCode: error.responseCode
      });
    }
  });
}

startServer();
