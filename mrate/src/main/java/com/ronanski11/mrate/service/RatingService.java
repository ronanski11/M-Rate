package com.ronanski11.mrate.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ronanski11.mrate.model.Rating;
import com.ronanski11.mrate.model.SharedWatchlist;
import com.ronanski11.mrate.model.SharedWatchlistEntry;
import com.ronanski11.mrate.model.Watchlist;
import com.ronanski11.mrate.model.WatchlistEntry;
import com.ronanski11.mrate.repository.RatingRepository;
import com.ronanski11.mrate.repository.SharedWatchlistRepository;
import com.ronanski11.mrate.repository.WatchlistRepository;

@Service
public class RatingService {

	@Autowired
	RatingRepository repo;

	@Autowired
	WatchlistRepository wRepo;

	@Autowired
	SharedWatchlistRepository swRepo;

	public Rating createRating(Rating rating, String userId) {
		Watchlist w = wRepo.findByUserId(userId);
		List<SharedWatchlist> swl = swRepo.findByUserId(userId);

		if (w == null) {
			Watchlist nw = new Watchlist();
			nw.setUserId(userId);
			nw.setMovies(new HashMap<String, WatchlistEntry>());
			wRepo.save(nw);
		} else if (w.getMovies().containsKey(rating.getImdbId())) {
			WatchlistEntry we = w.getMovies().get(rating.getImdbId());
			we.setRating(rating.getRating());
			we.setWatched(true);
			w.getMovies().put(rating.getImdbId(), we);
			wRepo.save(w);
		}

		for (SharedWatchlist sw : swl) {
			Map<String, SharedWatchlistEntry> entries = sw.getMovies();
			if (entries.containsKey(rating.getImdbId())) {
				SharedWatchlistEntry swle = entries.get(rating.getImdbId());
				swle.getRatings().put(userId, rating.getRating());
				if (swle.getRatings().size() == sw.getUserIds().size()) {
					swle.setWatched(true);
				}
				entries.put(rating.getImdbId(), swle);
				sw.setMovies(entries);
				swRepo.save(sw);
			}
		}

		Rating r = repo.findByUserIdAndImdbId(userId, rating.getImdbId());

		if (r != null) {
			r.setRating(rating.getRating());
			r.setLastUpdated(LocalDateTime.now());
			repo.save(r);
			return r;
		}

		rating.setUserId(userId);
		rating.setLastUpdated(LocalDateTime.now());
		return repo.save(rating);
	}

	public Rating getRatingByImdbId(String imdbId, String id) {
		return repo.findByUserIdAndImdbId(id, imdbId);
	}

}
