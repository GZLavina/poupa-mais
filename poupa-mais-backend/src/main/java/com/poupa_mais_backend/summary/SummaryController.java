package com.poupa_mais_backend.summary;

import com.poupa_mais_backend.security.AuthenticatedUser;
import com.poupa_mais_backend.transaction.TransactionType;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/summary")
public class SummaryController {

    private final SummaryService summaryService;

    public SummaryController(SummaryService summaryService) {
        this.summaryService = summaryService;
    }

    @GetMapping("/balance")
    public BalanceResponse balance(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return summaryService.balance(requireUserId(user), startDate, endDate);
    }

    @GetMapping("/by-category")
    public CategorySummaryResponse byCategory(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) TransactionType type
    ) {
        return summaryService.byCategory(requireUserId(user), startDate, endDate, type);
    }

    private Long requireUserId(AuthenticatedUser user) {
        if (user == null || user.id() == null) {
            throw new InsufficientAuthenticationException("Authentication required");
        }
        return user.id();
    }
}
