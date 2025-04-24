package com.ronanski11.mrate.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ronanski11.mrate.model.Watchlist;
import com.ronanski11.mrate.model.WatchlistEntry;
import com.ronanski11.mrate.repository.WatchlistRepository;

@Service
public class WatchlistService {
	
	@Autowired
	WatchlistRepository repo;

	public Map<String, WatchlistEntry> getWatchlist(String id) {
		return repo.findByUserId(id).getMovies();
	}

	public void changeWatchlistEntry(String imdbId, String id) {
	    Watchlist w = repo.findByUserId(id);	

	    if (w == null) {
	        w = new Watchlist();
	        w.setUserId(id);
	        w.setMovies(new HashMap<String, WatchlistEntry>());
	    }

	    if (w.getMovies().containsKey(imdbId)) {
	        w.getMovies().remove(imdbId);
	    } else {
	        WatchlistEntry we = new WatchlistEntry();
	        we.setAddedDate(LocalDateTime.now());
	        we.setWatched(false);
	        w.getMovies().put(imdbId, we);
	    }

	    repo.save(w);
	}

	public Boolean isPresent(String id, String imdbId) {
		if (repo.findByUserId(id) == null) return false;
		return repo.findByUserId(id).getMovies().containsKey(imdbId);
	}

	public Watchlist getFullWatchlist(String id) {
		return repo.findByUserId(id);
	}

}
