<?php

test('redirects an unauthenticated visitor to the admin sign-in screen', function () {
    $response = $this->get('/');

    $response->assertRedirect(route('login', ['role' => 'admin']));
});
