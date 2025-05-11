<?php

namespace App\Http\Controllers;

use App\Models\ChatbotRule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Log;

class ChatbotRuleController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $permissions = RoleHelper::getRolePermissions($role);
        $navigation = RoleHelper::getNavigationMenu($role);

        // Ambil semua aturan chatbot beserta data user pembuatnya
        $chatbotRules = ChatbotRule::with('user')->get();

        return Inertia::render('Admin/ChatbotRule/index', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'navigation' => $navigation,
            'chatbotRules' => $chatbotRules,
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $permissions = RoleHelper::getRolePermissions($role);
        $navigation = RoleHelper::getNavigationMenu($role);

        return Inertia::render('Admin/ChatbotRule/add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'navigation' => $navigation,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'keyword' => 'required|string|max:255',
            'response' => 'required|string',
        ]);

        try {
            Log::debug('Creating chatbot rule', [
                'keyword' => $request->keyword,
                'response' => $request->response,
                'created_by' => Auth::id(),
            ]);

            ChatbotRule::create([
                'user_id' => Auth::id(),
                'keyword' => $request->keyword,
                'response' => $request->response,
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating chatbot rule: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal membuat aturan chatbot: ' . $e->getMessage()])->withInput();
        }

        return redirect()->route('admin.chatbot-rules.index')->with('success', 'Aturan Chatbot berhasil ditambahkan.');
    }

    public function edit(ChatbotRule $chatbotRule)
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $permissions = RoleHelper::getRolePermissions($role);
        $navigation = RoleHelper::getNavigationMenu($role);

        return Inertia::render('Admin/ChatbotRule/edit', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'navigation' => $navigation,
            'chatbotRule' => $chatbotRule,
        ]);
    }

    public function update(Request $request, ChatbotRule $chatbotRule)
    {
        $request->validate([
            'keyword' => 'required|string|max:255',
            'response' => 'required|string',
        ]);

        try {
            Log::debug('Updating chatbot rule', [
                'id' => $chatbotRule->id,
                'keyword' => $request->keyword,
                'response' => $request->response,
                'updated_by' => Auth::id(),
            ]);

            $chatbotRule->update([
                'keyword' => $request->keyword,
                'response' => $request->response,
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating chatbot rule: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal memperbarui aturan chatbot: ' . $e->getMessage()])->withInput();
        }

        return redirect()->route('admin.chatbot-rules.index')->with('success', 'Aturan Chatbot berhasil diperbarui.');
    }

    public function destroy(ChatbotRule $chatbotRule)
    {
        try {
            Log::debug('Deleting chatbot rule', [
                'id' => $chatbotRule->id,
                'keyword' => $chatbotRule->keyword,
            ]);

            $chatbotRule->delete();
        } catch (\Exception $e) {
            Log::error('Error deleting chatbot rule: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal menghapus aturan chatbot: ' . $e->getMessage()]);
        }

        return redirect()->route('admin.chatbot-rules.index')->with('success', 'Aturan Chatbot berhasil dihapus.');
    }
}