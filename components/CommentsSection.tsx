import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { commentsService } from "../services/supabase/comments";
import { Comment } from "../services/supabase/types";
import { useAuth } from "../contexts/AuthContext";
import { Colors, Typography, Spacing, BorderRadius } from "../constants/Theme";
import { t } from "../constants/Translations";
import AnimatedButton from "./AnimatedButton";

const MAX_COMMENT_LENGTH = 200;

function formatRelativeTime(dateStr: string): string {
  const then = new Date(dateStr).getTime();
  const diffMin = Math.floor(Math.max(0, Date.now() - then) / 60000);

  if (diffMin < 1) return "ara mateix";
  if (diffMin < 60) return `fa ${diffMin} min`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `fa ${diffH} ${diffH === 1 ? "hora" : "hores"}`;

  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `fa ${diffD} ${diffD === 1 ? "dia" : "dies"}`;

  const diffM = Math.floor(diffD / 30);
  if (diffM < 12) return `fa ${diffM} ${diffM === 1 ? "mes" : "mesos"}`;

  const diffY = Math.floor(diffM / 12);
  return `fa ${diffY} ${diffY === 1 ? "any" : "anys"}`;
}

interface CommentsSectionProps {
  spotId: string;
}

export default function CommentsSection({ spotId }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadComments();
  }, [spotId]);

  async function loadComments() {
    try {
      setLoadError(false);
      const data = await commentsService.getBySpotId(spotId);
      setComments(data);
    } catch (error) {
      console.error("Error loading comments:", error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  const canSend = newContent.trim().length > 0 && !submitting;

  async function handleSend() {
    const content = newContent.trim();
    if (!content || submitting) return;

    setSubmitting(true);
    try {
      await commentsService.create(spotId, content);
      setNewContent("");
      await loadComments();
    } catch (error) {
      console.error("Error creating comment:", error);
      Alert.alert(t.error, t.errorCreatingComment);
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(comment: Comment) {
    setEditingId(comment.id);
    setEditingContent(comment.content);
  }

  async function handleUpdate(commentId: string) {
    const content = editingContent.trim();
    if (!content || savingEdit) return;

    setSavingEdit(true);
    try {
      await commentsService.update(commentId, content);
      setEditingId(null);
      await loadComments();
    } catch (error) {
      console.error("Error updating comment:", error);
      Alert.alert(t.error, t.errorUpdatingComment);
    } finally {
      setSavingEdit(false);
    }
  }

  function confirmDelete(comment: Comment) {
    Alert.alert(t.commentDeleteTitle, t.commentDeleteMessage, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.delete,
        style: "destructive",
        onPress: () => handleDelete(comment.id),
      },
    ]);
  }

  async function handleDelete(commentId: string) {
    try {
      await commentsService.remove(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
      Alert.alert(t.error, t.errorDeletingComment);
    }
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>
        {t.comments} ({comments.length})
      </Text>

      {user && (
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={newContent}
            onChangeText={setNewContent}
            placeholder={t.commentPlaceholder}
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={MAX_COMMENT_LENGTH}
          />
          <View style={styles.composerFooter}>
            <Text style={styles.counter}>
              {newContent.length}/{MAX_COMMENT_LENGTH}
            </Text>
            <AnimatedButton
              style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!canSend}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={Colors.onPrimary} />
              ) : (
                <Text style={styles.sendButtonText}>{t.commentSend}</Text>
              )}
            </AnimatedButton>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      ) : loadError ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>{t.errorLoadingComments}</Text>
          <TouchableOpacity onPress={loadComments} activeOpacity={0.7}>
            <Text style={styles.retryText}>{t.retry}</Text>
          </TouchableOpacity>
        </View>
      ) : comments.length === 0 ? (
        <Text style={styles.emptyText}>{t.commentEmpty}</Text>
      ) : (
        comments.map((comment) => {
          const isOwner = user?.id === comment.user_id;
          const isEditing = editingId === comment.id;

          return (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <Text style={styles.username}>
                  {comment.username || t.commentAnonymous}
                </Text>
                <Text style={styles.timestamp}>
                  {formatRelativeTime(comment.created_at)}
                </Text>
              </View>

              {isEditing ? (
                <View>
                  <TextInput
                    style={[styles.input, styles.editInput]}
                    value={editingContent}
                    onChangeText={setEditingContent}
                    multiline
                    maxLength={MAX_COMMENT_LENGTH}
                    placeholderTextColor={Colors.textMuted}
                  />
                  <View style={styles.editActions}>
                    <Text style={styles.counter}>
                      {editingContent.length}/{MAX_COMMENT_LENGTH}
                    </Text>
                    <View style={styles.editButtons}>
                      <TouchableOpacity
                        onPress={() => setEditingId(null)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.cancelText}>{t.cancel}</Text>
                      </TouchableOpacity>
                      <AnimatedButton
                        style={[
                          styles.saveButton,
                          (savingEdit || !editingContent.trim()) &&
                            styles.saveButtonDisabled,
                        ]}
                        onPress={() => handleUpdate(comment.id)}
                        disabled={savingEdit || !editingContent.trim()}
                      >
                        {savingEdit ? (
                          <ActivityIndicator
                            size="small"
                            color={Colors.onPrimary}
                          />
                        ) : (
                          <Text style={styles.saveButtonText}>{t.save}</Text>
                        )}
                      </AnimatedButton>
                    </View>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={styles.content}>{comment.content}</Text>
                  {isOwner && (
                    <View style={styles.ownerActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => startEdit(comment)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="pencil-outline"
                          size={16}
                          color={Colors.primary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => confirmDelete(comment)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color={Colors.error}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: Spacing.horizontalPadding,
    marginTop: 24,
  },
  title: {
    ...Typography.industrialLabel,
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 12,
  },
  composer: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: BorderRadius.card,
    borderWidth: 0.5,
    borderColor: Colors.primary,
    padding: Spacing.cardPadding,
    marginBottom: 16,
  },
  input: {
    ...Typography.bodyMain,
    color: Colors.textPrimary,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: BorderRadius.button,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: "top",
  },
  editInput: {
    marginBottom: 8,
  },
  composerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  counter: {
    ...Typography.industrialLabel,
    fontSize: 10,
    color: Colors.textMuted,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: BorderRadius.tag,
    minWidth: 90,
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    ...Typography.industrialLabel,
    fontSize: 12,
    color: Colors.onPrimary,
  },
  loadingContainer: {
    paddingVertical: Spacing.verticalPadding,
    alignItems: "center",
  },
  emptyText: {
    ...Typography.bodyMain,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingVertical: Spacing.verticalPadding,
  },
  retryText: {
    ...Typography.industrialLabel,
    color: Colors.primary,
    marginTop: 8,
  },
  commentCard: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: BorderRadius.card,
    borderWidth: 0.5,
    borderColor: Colors.surfaceHighest,
    padding: Spacing.cardPadding,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  username: {
    ...Typography.industrialLabel,
    color: Colors.primary,
    flexShrink: 1,
  },
  timestamp: {
    ...Typography.industrialLabel,
    fontSize: 10,
    color: Colors.textMuted,
    marginLeft: 8,
  },
  content: {
    ...Typography.bodyMain,
    color: Colors.textPrimary,
  },
  ownerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    padding: 4,
  },
  editActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  editButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cancelText: {
    ...Typography.industrialLabel,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: BorderRadius.tag,
    minWidth: 70,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    ...Typography.industrialLabel,
    fontSize: 12,
    color: Colors.onPrimary,
  },
});