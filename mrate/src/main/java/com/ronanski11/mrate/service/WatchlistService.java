package com.ronanski11.mrate.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ronanski11.mrate.model.Rating;
import com.ronanski11.mrate.model.Watchlist;
import com.ronanski11.mrate.model.WatchlistEntry;
import com.ronanski11.mrate.repository.RatingRepository;
import com.ronanski11.mrate.repository.WatchlistRepository;

@Service
public class WatchlistService {

	@Autowired
	WatchlistRepository repo;

	@Autowired
	RatingRepository rRepo;

	public Map<String, WatchlistEntry> getWatchlist(String id) {
		Watchlist result = repo.findByUserId(id);
		return result == null ? new HashMap<String, WatchlistEntry>() : result.getMovies();
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
			Rating rating = rRepo.findByUserIdAndImdbId(id, imdbId);
			if (rating != null) {
				we.setRating(rating.getRating());
			}
			w.getMovies().put(imdbId, we);
		}

		repo.save(w);
	}

	public Boolean isPresent(String id, String imdbId) {
		if (repo.findByUserId(id) == null)
			return false;
		return repo.findByUserId(id).getMovies().containsKey(imdbId);
	}

	public Watchlist getFullWatchlist(String id) {
		return repo.findByUserId(id);
	}

}
