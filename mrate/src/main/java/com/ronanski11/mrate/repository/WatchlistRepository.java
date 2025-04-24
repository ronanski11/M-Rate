package com.ronanski11.mrate.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.ronanski11.mrate.model.Watchlist;

@Repository
public interface WatchlistRepository extends MongoRepository<Watchlist, String>{

	Watchlist findByUserId(String userId);

}
