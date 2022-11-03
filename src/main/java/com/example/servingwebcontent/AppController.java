package com.example.servingwebcontent;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AppController {
	
	@GetMapping("/home")
	public String viewHome() {
		return "Home";
	}
	
	@GetMapping("/login")
	public String viewLogin() {
		return "Login";
	}
	@GetMapping("/register")
	public String viewRegister() {
		return "Register";
	}
	@GetMapping("/forgotPassword")
	public String forgotPassword() {
		return "ForgotPassword";
	}
}
