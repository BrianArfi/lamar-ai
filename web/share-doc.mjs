// Share Google Doc with a specific email via Drive API
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const FILE_ID = "1X0_L1uK4RlTDjy2c0Xv1mFA6AiA_-L8rZlCDhUX8_ZA";
const SHARE_WITH = "alyssyarhamadina001@gmail.com";

// Refresh token
const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    grant_type: "refresh_token",
  }),
});
const { access_token, error } = await tokenRes.json();
if (error || !access_token) {
  console.error("Token refresh failed:", error);
  process.exit(1);
}
console.log("Token refreshed.");

// Share the file
const shareRes = await fetch(
  `https://www.googleapis.com/drive/v3/files/${FILE_ID}/permissions`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "user",
      role: "writer",
      emailAddress: SHARE_WITH,
    }),
  }
);
const shareData = await shareRes.json();
if (shareData.id) {
  console.log(`Shared successfully with ${SHARE_WITH}`);
} else {
  console.error("Share failed:", JSON.stringify(shareData));
}
