package com.ronanski11.mrate.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ronanski11.mrate.model.Rating;
import com.ronanski11.mrate.model.Watchlist;
import com.ronanski11.mrate.model.WatchlistEntry;
import com.ronanski11.mrate.repository.RatingRepository;
import com.ronanski11.mrate.repository.WatchlistRepository;

@Service
public class RatingService {

	@Autowired
	RatingRepository repo;
	
	@Autowired
	WatchlistRepository wRepo;

	public Rating createRating(Rating rating, String userId) {
		Watchlist w = wRepo.findByUserId(userId);
		
		if (w.getMovies().containsKey(rating.getImdbId())) {
			WatchlistEntry we = w.getMovies().get(rating.getImdbId());
			we.setRating(rating.getRating());
			we.setWatched(true);
			w.getMovies().put(rating.getImdbId(), we);
			wRepo.save(w);
		}
		
		rating.setUserId(userId);
		return repo.save(rating);
	}

}
