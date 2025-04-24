package com.ronanski11.mrate.security;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ronanski11.mrate.model.Role;
import com.ronanski11.mrate.model.User;
import com.ronanski11.mrate.model.Watchlist;
import com.ronanski11.mrate.repository.UserRepository;
import com.ronanski11.mrate.repository.WatchlistRepository;
import com.ronanski11.mrate.security.model.AuthenticationRequest;
import com.ronanski11.mrate.security.model.AuthenticationResponse;
import com.ronanski11.mrate.security.model.RegisterRequest;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

	private final UserRepository userRepository;
	private final WatchlistRepository watchlistRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final AuthenticationManager authenticationManager;

	public ResponseEntity<?> register(RegisterRequest request) {
		var user = User.builder().username(request.getUsername())
				.password(passwordEncoder.encode(request.getPassword())).role(Role.USER).profilePicId("").build();
		if (userRepository.findByUsername(request.getUsername()).isPresent())
			return ResponseEntity.status(HttpStatus.CONFLICT).body("Username is taken.");
		User savedUser = userRepository.save(user);
		Watchlist watchlist = new Watchlist();
		watchlist.setUserId(savedUser.getId());
		watchlistRepository.save(watchlist);
		var jwtToken = jwtService.generateToken(user, savedUser.getId());
		return ResponseEntity.ok(AuthenticationResponse.builder().token(jwtToken).build());
	}

	public AuthenticationResponse authenticate(AuthenticationRequest request) {
		authenticationManager
				.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
		var user = userRepository.findByUsername(request.getUsername()).orElseThrow();
		var jwtToken = jwtService.generateToken(user, user.getId());
		return AuthenticationResponse.builder().token(jwtToken).build();
	}

	public String encodePassword(String password) {
		return passwordEncoder.encode(password);
	}
	
	public String getId() {
	    return userRepository.findByUsername(getUsername()).get().getId();
	}

	public String getUsername() {
		UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return userDetails.getUsername();
	}
	
	public boolean isAdmin() {
		return userRepository.findByUsername(getUsername()).get().getRole().equals(Role.ADMIN);
	}

	public void authenticatePassword(String username, String currentPassword) {
		authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, currentPassword));
	}

}
