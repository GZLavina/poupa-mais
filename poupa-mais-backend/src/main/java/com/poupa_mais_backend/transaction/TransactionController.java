package com.poupa_mais_backend.transaction;

import com.poupa_mais_backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse create(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody CreateTransactionRequest request
    ) {
        return transactionService.create(requireUserId(user), request);
    }

    @GetMapping
    public List<TransactionResponse> list(@AuthenticationPrincipal AuthenticatedUser user) {
        return transactionService.list(requireUserId(user));
    }

    private Long requireUserId(AuthenticatedUser user) {
        if (user == null || user.id() == null) {
            throw new InsufficientAuthenticationException("Authentication required");
        }
        return user.id();
    }
}
