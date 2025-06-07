<?php

namespace App\Traits;

use App\Models\FormSetting;
use Illuminate\Support\Carbon;

trait FormActivityTrait
{
    /**
     * Determine if a form is active based on its settings.
     *
     * @param FormSetting|null $settings
     * @return bool
     */
    protected function isFormActive(?FormSetting $settings): bool
    {
        if (!$settings) {
            return false;
        }

        $now = Carbon::now();
        if ($settings->submission_start && $settings->submission_deadline) {
            return $now->between($settings->submission_start, $settings->submission_deadline);
        }
        if ($settings->submission_start) {
            return $now->gte($settings->submission_start);
        }
        if ($settings->submission_deadline) {
            return $now->lte($settings->submission_deadline);
        }

        return $settings->accept_responses;
    }
}