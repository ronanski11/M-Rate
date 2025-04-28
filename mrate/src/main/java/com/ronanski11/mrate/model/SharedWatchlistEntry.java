package com.ronanski11.mrate.model;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import lombok.Data;

@Data
public class SharedWatchlistEntry {

	private Boolean watched = false;

	private LocalDateTime addedDate;

	private String addedByUsername;

	private Map<String, Double> ratings = new HashMap<>();

}
