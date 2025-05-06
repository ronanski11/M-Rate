package com.ronanski11.mrate.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ronanski11.mrate.model.Rating;
import com.ronanski11.mrate.security.AuthenticationService;
import com.ronanski11.mrate.service.RatingService;

@RestController
@RequestMapping("/api/rating")
public class RatingController {

	@Autowired
	AuthenticationService auth;
	
	@Autowired
	RatingService service;
	
	@PostMapping()
	public ResponseEntity<Rating> createRating(@RequestBody Rating rating) {
		return ResponseEntity.ok(service.createRating(rating, auth.getId()));
	}
	
	@GetMapping()
	public ResponseEntity<Rating> getRatingByImdbId(@RequestParam String imdbId) {
		return ResponseEntity.ok(service.getRatingByImdbId(imdbId, auth.getId()));
	}
	
	@GetMapping("/all")
	public ResponseEntity<List<Rating>> getAllRated() {
		return ResponseEntity.ok(service.getAllRated(auth.getId()));
	}
	
}
