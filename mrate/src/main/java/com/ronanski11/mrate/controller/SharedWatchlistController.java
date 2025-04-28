package com.ronanski11.mrate.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ronanski11.mrate.model.Rating;
import com.ronanski11.mrate.model.SharedWatchlist;
import com.ronanski11.mrate.security.AuthenticationService;
import com.ronanski11.mrate.security.model.RequiresWatchlistAccess;
import com.ronanski11.mrate.service.SharedWatchlistService;

@RestController
@RequestMapping("/api/shared-watchlist")
public class SharedWatchlistController {

    @Autowired
    private SharedWatchlistService service;
    
    @Autowired
    private AuthenticationService auth;
    
    @GetMapping
    public ResponseEntity<List<SharedWatchlist>> getUserSharedWatchlists() {
        return ResponseEntity.ok(service.getUserSharedWatchlists(auth.getId()));
    }
    
    @PostMapping
    public ResponseEntity<SharedWatchlist> createSharedWatchlist(@RequestBody SharedWatchlist watchlist) {
        return ResponseEntity.ok(service.createSharedWatchlist(watchlist, auth.getId(), auth.getUsername()));
    }
    
    @GetMapping("/{watchlistId}")
    @RequiresWatchlistAccess
    public ResponseEntity<SharedWatchlist> getSharedWatchlist(@PathVariable String watchlistId) {
        return ResponseEntity.ok(service.getSharedWatchlist(watchlistId));
    }
    
    @PutMapping("/{watchlistId}")
    @RequiresWatchlistAccess
    public ResponseEntity<SharedWatchlist> updateSharedWatchlist(
            @PathVariable String watchlistId, 
            @RequestBody SharedWatchlist watchlist) {
        return ResponseEntity.ok(service.updateSharedWatchlist(watchlistId, watchlist));
    }
    
    @DeleteMapping("/{watchlistId}")
    @RequiresWatchlistAccess
    public ResponseEntity<?> deleteSharedWatchlist(@PathVariable String watchlistId) {
        service.deleteSharedWatchlist(watchlistId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{watchlistId}/user/{username}")
    @RequiresWatchlistAccess
    public ResponseEntity<?> addUserToWatchlist(
            @PathVariable String watchlistId, 
            @PathVariable String username) {
        service.addUserToWatchlist(watchlistId, username);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{watchlistId}/user/{username}")
    @RequiresWatchlistAccess
    public ResponseEntity<?> removeUserFromWatchlist(
            @PathVariable String watchlistId, 
            @PathVariable String username) {
        service.removeUserFromWatchlist(watchlistId, username);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{watchlistId}/movie/{imdbId}")
    @RequiresWatchlistAccess
    public ResponseEntity<?> addMovieToWatchlist(
            @PathVariable String watchlistId, 
            @PathVariable String imdbId) {
        service.addMovieToWatchlist(watchlistId, imdbId, auth.getUsername());
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{watchlistId}/movie/{imdbId}")
    @RequiresWatchlistAccess
    public ResponseEntity<?> removeMovieFromWatchlist(
            @PathVariable String watchlistId, 
            @PathVariable String imdbId) {
        service.removeMovieFromWatchlist(watchlistId, imdbId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{watchlistId}/movie/{imdbId}/rating")
    @RequiresWatchlistAccess
    public ResponseEntity<?> rateMovie(
            @PathVariable String watchlistId, 
            @PathVariable String imdbId,
            @RequestBody Rating rating) {
        service.rateMovie(watchlistId, imdbId, auth.getId(), rating.getRating());
        return ResponseEntity.ok().build();
    }
}