package com.ronanski11.mrate.security.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ronanski11.mrate.security.AuthenticationService;
import com.ronanski11.mrate.security.model.AuthenticationRequest;
import com.ronanski11.mrate.security.model.AuthenticationResponse;
import com.ronanski11.mrate.security.model.RegisterRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {
	
	private final AuthenticationService service;
	
	// @PostMapping("/register")
	public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
		return service.register(request);
	}
	
	@PostMapping("/authenticate")
	public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
		return ResponseEntity.ok(service.authenticate(request));
	}
	
}
