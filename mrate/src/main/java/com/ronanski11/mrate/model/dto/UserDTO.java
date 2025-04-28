package com.ronanski11.mrate.model.dto;

import java.time.LocalDate;
import java.util.List;

import com.ronanski11.mrate.model.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

	private String id;

	private String username;

	private Role role;

	private List<String> sharedWatchlists;

	private String profilePicId;

	private LocalDate joined;

}