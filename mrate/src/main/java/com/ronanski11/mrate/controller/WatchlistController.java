package com.ronanski11.mrate.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ronanski11.mrate.model.Watchlist;
import com.ronanski11.mrate.model.WatchlistEntry;
import com.ronanski11.mrate.security.AuthenticationService;
import com.ronanski11.mrate.service.WatchlistService;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {
	
	@Autowired
	WatchlistService service;
	
	@Autowired
	AuthenticationService auth;
	
	@GetMapping()
	public ResponseEntity<Map<String, WatchlistEntry>> getWatchlist() {
		return ResponseEntity.ok(service.getWatchlist(auth.getId()));
	}
	
	@GetMapping("/full")
	public ResponseEntity<Watchlist> getFullWatchlist() {
		return ResponseEntity.ok(service.getFullWatchlist(auth.getId()));
	}
	
	@PostMapping("/{imdbId}")
	public ResponseEntity<?> addWatchlistEntry(@PathVariable String imdbId) {
		service.changeWatchlistEntry(imdbId, auth.getId());
		return ResponseEntity.accepted().build();
	}
	
	@GetMapping("/isPresent")
	public ResponseEntity<Boolean> isPresent(@RequestParam String imdbId) {
		return ResponseEntity.ok(service.isPresent(auth.getId(), imdbId));
	}

}
