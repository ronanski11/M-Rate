package com.ronanski11.mrate.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ronanski11.mrate.model.Rating;
import com.ronanski11.mrate.repository.RatingRepository;

@Service
public class RatingService {

	@Autowired
	RatingRepository repo;

	public Rating createRating(Rating rating, String userId) {
		rating.setOverall((rating.getCultural() + rating.getEmotional() + rating.getPerformance()
				+ rating.getTechnical() + rating.getNarrative()) / 5);
		rating.setUserId(userId);
		
		return repo.save(rating);
	}

}
