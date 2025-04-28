package com.ronanski11.mrate.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ronanski11.mrate.model.SharedWatchlist;
import com.ronanski11.mrate.model.SharedWatchlistEntry;
import com.ronanski11.mrate.model.User;
import com.ronanski11.mrate.repository.SharedWatchlistRepository;
import com.ronanski11.mrate.repository.UserRepository;

@Service
public class SharedWatchlistService {
    
    @Autowired
    private SharedWatchlistRepository repository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<SharedWatchlist> getUserSharedWatchlists(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        return user.getSharedWatchlists().stream()
                .map(watchlistId -> repository.findById(watchlistId)
                        .orElse(null))
                .filter(watchlist -> watchlist != null)
                .collect(Collectors.toList());
    }
    
    public SharedWatchlist createSharedWatchlist(SharedWatchlist watchlist, String userId, String username) {
        // Initialize new watchlist
        watchlist.setOwnerId(userId);
        watchlist.setLastUpdated(LocalDateTime.now());
        
        if (watchlist.getUserIds() == null) {
            watchlist.setUserIds(List.of(userId));
        } else if (!watchlist.getUserIds().contains(userId)) {
            watchlist.getUserIds().add(userId);
        }
        
        if (watchlist.getMovies() == null) {
            watchlist.setMovies(new HashMap<>());
        }
        
        // Save watchlist
        SharedWatchlist savedWatchlist = repository.save(watchlist);
        
        // Update user's shared watchlists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        if (user.getSharedWatchlists() == null) {
            user.setSharedWatchlists(List.of(savedWatchlist.getId()));
        } else {
            user.getSharedWatchlists().add(savedWatchlist.getId());
        }
        
        userRepository.save(user);
        
        return savedWatchlist;
    }
    
    public SharedWatchlist getSharedWatchlist(String watchlistId) {
        return repository.findById(watchlistId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Watchlist not found"));
    }
    
    public SharedWatchlist updateSharedWatchlist(String watchlistId, SharedWatchlist updatedWatchlist) {
        SharedWatchlist existingWatchlist = repository.findById(watchlistId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Watchlist not found"));
        
        // Update fields
        existingWatchlist.setName(updatedWatchlist.getName());
        existingWatchlist.setDescription(updatedWatchlist.getDescription());
        existingWatchlist.setLastUpdated(LocalDateTime.now());
        
        return repository.save(existingWatchlist);
    }
    
    public void deleteSharedWatchlist(String watchlistId) {
        SharedWatchlist watchlist = repository.findById(watchlistId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Watchlist not found"));
        
        // Remove watchlist ID from all users
        for (String userId : watchlist.getUserIds()) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && user.getSharedWatchlists() != null) {
                user.getSharedWatchlists().remove(watchlistId);
                userRepository.save(user);
            }
        }
        
        // Delete the watchlist
        repository.deleteById(watchlistId);
    }
    
    public void addUserToWatchlist(String watchlistId, String username) {
        SharedWatchlist watchlist = repository.findById(watchlistId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Watchlist not found"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Add user to watchlist if not already present
        if (!watchlist.getUserIds().contains(user.getId())) {
            watchlist.getUserIds().add(user.getId());
            watchlist.setLastUpdated(LocalDateTime.now());
            repository.save(watchlist);
            
            // Add watchlist to user's shared watchlists
            if (user.getSharedWatchlists() == null) {
                user.setSharedWatchlists(List.of(watchlistId));
            } else {
                user.getSharedWatchlists().add(watchlistId);
            }
            
            userRepository.save(user);
        }
    }
    
    public void removeUserFromWatchlist(String watchlistId, String username) {
        SharedWatchlist watchlist = repository.findById(watchlistId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Watchlist not found"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Cannot remove the owner
        if (watchlist.getOwnerId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot remove the owner from the watchlist");
        }
        
        // Remove user from watchlist
        watchlist.getUserIds().remove(user.getId());
        watchlist.setLastUpdated(LocalDateTime.now());
        repository.save(watchlist);
        
        // Remove watchlist from user's shared watchlists
        if (user.getSharedWatchlists() != null) {
            user.getSharedWatchlists().remove(watchlistId);
            userRepository.save(user);
        }
    }
    
    public void addMovieToWatchlist(String watchlistId, String imdbId, String addedByUsername) {
        SharedWatchlist watchlist = repository.findById(watchlistId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Watchlist not found"));
        
        // Check if movie already exists
        if (!watchlist.getMovies().containsKey(imdbId)) {
            SharedWatchlistEntry entry = new SharedWatchlistEntry();
            entry.setAddedDate(LocalDateTime.now());
            entry.setAddedByUsername(addedByUsername);
            entry.setWatched(false);
            entry.setRatings(new HashMap<>());
            
            watchlist.getMovies().put(imdbId, entry);
            watchlist.setLastUpdated(LocalDateTime.now());
            repository.save(watchlist);
        }
    }
    
    public void removeMovieFromWatchlist(String watchlistId, String imdbId) {
        SharedWatchlist watchlist = repository.findById(watchlistId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Watchlist not found"));
        
        if (watchlist.getMovies().containsKey(imdbId)) {
            watchlist.getMovies().remove(imdbId);
            watchlist.setLastUpdated(LocalDateTime.now());
            repository.save(watchlist);
        }
    }
    
    public void rateMovie(String watchlistId, String imdbId, String userId, Double rating) {
        SharedWatchlist watchlist = repository.findById(watchlistId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Watchlist not found"));
        
        if (!watchlist.getMovies().containsKey(imdbId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found in watchlist");
        }
        
        SharedWatchlistEntry entry = watchlist.getMovies().get(imdbId);
        entry.getRatings().put(userId, rating);
        
        // Update watched status based on all users having rated
        boolean allUsersRated = watchlist.getUserIds().stream()
                .allMatch(id -> entry.getRatings().containsKey(id));
        
        entry.setWatched(allUsersRated);
        
        watchlist.setLastUpdated(LocalDateTime.now());
        repository.save(watchlist);
    }
    
    public boolean isMovieWatchedByAllUsers(String watchlistId, String imdbId) {
        SharedWatchlist watchlist = repository.findById(watchlistId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Watchlist not found"));
        
        if (!watchlist.getMovies().containsKey(imdbId)) {
            return false;
        }
        
        SharedWatchlistEntry entry = watchlist.getMovies().get(imdbId);
        
        return watchlist.getUserIds().stream()
                .allMatch(userId -> entry.getRatings().containsKey(userId));
    }
}