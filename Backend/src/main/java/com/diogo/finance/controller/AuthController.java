package com.diogo.finance.controller;

import com.diogo.finance.dto.AuthRequest;
import com.diogo.finance.dto.AuthResponse;
import com.diogo.finance.dto.RegisterRequest;
import com.diogo.finance.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        return authService.login(request);
    }
}

