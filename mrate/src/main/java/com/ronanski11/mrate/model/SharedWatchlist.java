package com.ronanski11.mrate.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Document
@Data
public class SharedWatchlist {

	@Id
	private String id;

	private String name;

	private String description;

	private String ownerId;

	private List<String> userIds = new ArrayList<String>();

	private Map<String, SharedWatchlistEntry> movies = new HashMap<>();

	private LocalDateTime lastUpdated;

}
