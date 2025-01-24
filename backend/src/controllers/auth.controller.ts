import { RequestHandler } from "express";
import prisma from "../db/prisma.js";
import bcryptjs from "bcryptjs";
import generateToken from "../utils/generateToken.js";

export const signup: RequestHandler = async (req, res) => {
	try {
		const { fullName, username, password, confirmPassword, gender } = req.body;

		if (!fullName || !username || !password || !confirmPassword || !gender) {
			res.status(400).json({ error: "Please fill in all fields" });
			return;
		}

		if (password !== confirmPassword) {
			res.status(400).json({ error: "Passwords don't match" });
			return;
		}

		const user = await prisma.user.findUnique({ where: { username } });

		if (user) {
			res.status(400).json({ error: "Username already exists" });
			return;
		}

		const salt = await bcryptjs.genSalt(10);
		const hashedPassword = await bcryptjs.hash(password, salt);

		// https://avatar-placeholder.iran.liara.run/
		const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
		const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

		const newUser = await prisma.user.create({
			data: {
				fullName,
				username,
				password: hashedPassword,
				gender,
				profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
			},
		});

		if (newUser) {
			// generate token in a sec
			generateToken(newUser.id, res);

			res.status(201).json({
				id: newUser.id,
				fullName: newUser.fullName,
				username: newUser.username,
				profilePic: newUser.profilePic,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error: any) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const login: RequestHandler = async (req, res) => {
	try {
		
		const { username, password } = req.body;
		const user = await prisma.user.findUnique({ where: { username } });
		if (!user) {
			res.status(400).json({ error: "User not found!" });
			return;
		}
		const isPasswordCorrect = await bcryptjs.compare(password, user.password);

		if (!isPasswordCorrect) {
			res.status(400).json({ error: "Password is incorrect!" });
			return;
		}

		generateToken(user.id, res)

		res.status(200).json({
			id: user.id,
			fullName: user.fullName,
			username: user.username,
			profilePic: user.profilePic
		})

	} catch (error: any) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const logout: RequestHandler = async (req, res) => {

	try {
		res.cookie("jwt", "", {maxAge: 0});
		res.status(200).json({ message: "Logged out successfully"});
	} catch (error: any) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
}

export const getMe: RequestHandler = async(req, res) => {

	try {
		const user = await prisma.user.findUnique({ where: { id: req.user.id} });
		if (!user) {
			res.status(404).json({ error: "User not found" });
			return;
		}

		res.status(200).json({
			id: user.id,
			fullName: user.fullName,
			username: user.username,
			profilePic: user.profilePic
		});

	} catch (error: any) {
		console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};