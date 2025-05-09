package com.ronanski11.mrate.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.ronanski11.mrate.model.Rating;

@Repository
public interface RatingRepository extends MongoRepository<Rating, String>{

	Rating findByUserIdAndImdbId(String id, String imdbId);

	List<Rating> findByUserId(String id);

}
