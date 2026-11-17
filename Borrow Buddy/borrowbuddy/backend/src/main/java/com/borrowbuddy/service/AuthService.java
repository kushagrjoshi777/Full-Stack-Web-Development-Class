package com.borrowbuddy.service;

import com.borrowbuddy.dto.Dtos.*;
import com.borrowbuddy.entity.Role;
import com.borrowbuddy.entity.User;
import com.borrowbuddy.exception.ApiException;
import com.borrowbuddy.repository.UserRepository;
import com.borrowbuddy.security.JwtService;
import com.borrowbuddy.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    /** Resolves the authenticated user from the security context. */
    public User currentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal p)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return users.findById(p.getId()).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User no longer exists"));
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("An account with this email already exists");
        }
        User u = new User();
        u.setName(req.name().trim());
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(req.password()));
        u.setRole(Role.USER);
        u.setPhone(blankToNull(req.phone()));
        u.setLocation(blankToNull(req.location()));
        u = users.save(u);
        return new AuthResponse(jwt.generate(u), com.borrowbuddy.dto.Dtos.toDto(u));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User u = users.findByEmailIgnoreCase(req.email().trim())
                .orElseThrow(() -> new BadCredentialsException("bad credentials"));
        if (!encoder.matches(req.password(), u.getPasswordHash())) throw new BadCredentialsException("bad credentials");
        if (!u.isEnabled()) throw new DisabledException("disabled");
        return new AuthResponse(jwt.generate(u), com.borrowbuddy.dto.Dtos.toDto(u));
    }

    @Transactional
    public UserDto updateProfile(UpdateProfileRequest req) {
        User u = currentUser();
        u.setName(req.name().trim());
        u.setPhone(blankToNull(req.phone()));
        u.setLocation(blankToNull(req.location()));
        u.setBio(blankToNull(req.bio()));
        return com.borrowbuddy.dto.Dtos.toDto(users.save(u));
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
