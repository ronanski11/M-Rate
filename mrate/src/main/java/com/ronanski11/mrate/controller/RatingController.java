package com.ronanski11.mrate.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
	
}
