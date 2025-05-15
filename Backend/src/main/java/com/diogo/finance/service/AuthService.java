package com.diogo.finance.service;

import com.diogo.finance.dto.AuthRequest;
import com.diogo.finance.dto.AuthResponse;
import com.diogo.finance.dto.RegisterRequest;
import com.diogo.finance.model.User;
import com.diogo.finance.repository.UserRepository;
import com.diogo.finance.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return new AuthResponse("Email já está em uso.", null, null);
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));

        userRepository.save(user);
        return new AuthResponse("Registo concluído com sucesso.", user.getEmail(), null);
    }

    public AuthResponse login(AuthRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .filter(user -> encoder.matches(request.getPassword(), user.getPassword()))
                .map(user -> new AuthResponse(
                        jwtUtil.generateToken(user.getEmail()),
                        user.getEmail(),
                        "Login efetuado com sucesso."
                ))
                .orElse(new AuthResponse(null, null, "Credenciais inválidas"));
    }

}

