package com.ronanski11.mrate.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.ronanski11.mrate.model.SharedWatchlist;
import com.ronanski11.mrate.model.Watchlist;

@Repository
public interface SharedWatchlistRepository extends MongoRepository<SharedWatchlist, String>{

	Watchlist findByUserId(String id);

}
