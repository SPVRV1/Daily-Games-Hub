import nodemailer from "nodemailer";

/*const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});*/

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'santos51@ethereal.email',
        pass: 'HdzegtUU3nMHGnGHcg'
    }
});

export const sendResetEmail = async (email: string, token: string) => {
    const link = `http://localhost:5173/reset/${token}`;
    try {
        await transporter.sendMail({
            to: email,
            subject: "Reset password",
            html: `
      <h2>Reset password</h2>
      <a href="${link}">${link}</a>
    `,
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error("Mailer error: ", err.message)
    }
};

export const sendNewFriendEmail = async (
    email: string,
    username: string,
    friendUsername: string
) => {
    try {
        await transporter.sendMail({
            to: email,
            subject: "New friend on Daily Games Hub",
            html: `
      <h2>Hello ${username}!</h2>
      <p>You are now friends with <strong>${friendUsername}</strong> on Daily Games Hub.</p>
      <p>Open the app and compare your daily game results.</p>
    `,
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error("Mailer error: ", err.message);
    }
};
