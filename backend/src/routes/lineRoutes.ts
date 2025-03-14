import { Router, Request, Response } from "express";
import { Client } from "@line/bot-sdk";

const router = Router();

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
  channelSecret: process.env.LINE_CHANNEL_SECRET || "",
};

const client = new Client(lineConfig);

// Test endpoint to verify LINE configuration
router.get("/test", async (req: Request, res: Response) => {
  try {
    // Get bot info to verify connection
    const botInfo = await client.getBotInfo();
    res.json({
      status: "success",
      message: "LINE configuration is working",
      botInfo,
    });
  } catch (error) {
    console.error("LINE test error:", error);
    res.status(500).json({
      status: "error",
      message: "LINE configuration test failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Webhook endpoint for LINE events
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const events = req.body.events;
    console.log("Received LINE webhook events:", events);

    // Handle each event
    const results = await Promise.all(
      events.map(async (event: any) => {
        if (event.type === "message" && event.message.type === "text") {
          // Echo the received message
          return client.replyMessage(event.replyToken, {
            type: "text",
            text: `ได้รับข้อความ: ${event.message.text}`,
          });
        }
      })
    );

    res.json({ status: "success", results });
  } catch (error) {
    console.error("LINE webhook error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process LINE webhook",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
