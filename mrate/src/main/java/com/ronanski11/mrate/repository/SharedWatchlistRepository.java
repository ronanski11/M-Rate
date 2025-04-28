package com.ronanski11.mrate.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.ronanski11.mrate.model.SharedWatchlist;

@Repository
public interface SharedWatchlistRepository extends MongoRepository<SharedWatchlist, String>{

	@Query(value = "{ 'userIds': ?0 }")
	List<SharedWatchlist> findByUserId(String id);

}
