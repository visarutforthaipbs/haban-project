/**
 * Email service
 * This is a placeholder implementation. In a real application,
 * you would integrate with an email service like SendGrid, Mailgun, etc.
 */

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Email text content
 * @param {string} [options.html] - Email HTML content (optional)
 */
const sendEmail = async (options) => {
  // This is just a placeholder implementation
  console.log("Sending email:");
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Text: ${options.text}`);

  if (options.html) {
    console.log(`HTML: ${options.html}`);
  }

  // In a real implementation, you would use something like:
  // await sendgrid.send({...})
  // or
  // await transporter.sendMail({...})

  return {
    success: true,
    messageId: `mock-${Date.now()}`,
  };
};

module.exports = {
  sendEmail,
};
